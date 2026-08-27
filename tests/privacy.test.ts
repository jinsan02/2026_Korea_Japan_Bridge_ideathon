/**
 * Privacy guarantees that are structural rather than promised: what the event
 * log will accept, and what the review masking removes.
 */
import { describe, expect, it } from 'vitest';

import {
  EventBatchSchema,
  eventsToCsv,
  type StoredEvent,
} from '@/lib/experiment/events';
import { containsMaskablePii, maskText, MASK } from '@/lib/privacy/mask';
import { DOCUMENT_FIXTURES } from '@/lib/fixtures/documents';

function validEvent(payload: Record<string, unknown> = {}) {
  return {
    sessionId: 's-abc12345',
    condition: 'C' as const,
    language: 'ko' as const,
    type: 'practice_answer' as const,
    clientTime: '2026-08-27T10:00:00.000Z',
    payload,
  };
}

describe('event log schema', () => {
  it('accepts a de-identified event', () => {
    const parsed = EventBatchSchema.safeParse({
      events: [validEvent({ questionId: 'q1', isCorrect: true, hintStep: 0 })],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects any attempt to log free text', () => {
    // This is the guarantee: there is no field document content could go into,
    // so a mistake is a 400 rather than a silent leak.
    for (const field of ['text', 'note', 'content', 'query', 'ocrText', 'image']) {
      const parsed = EventBatchSchema.safeParse({
        events: [validEvent({ [field]: '주민등록번호 900101-1234567' })],
      });
      expect(parsed.success, `payload.${field} must be rejected`).toBe(false);
    }
  });

  it('rejects an event with an identifying session id shape', () => {
    const parsed = EventBatchSchema.safeParse({
      events: [{ ...validEvent(), sessionId: 'user@example.com' }],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a hint step outside the fixed three-step ladder', () => {
    const parsed = EventBatchSchema.safeParse({
      events: [validEvent({ hintStep: 7 })],
    });
    expect(parsed.success).toBe(false);
  });

  it('escapes CSV cells that contain a comma or a quote', () => {
    const event: StoredEvent = {
      ...validEvent({ questionId: 'a,b"c' }),
      serverTime: '2026-08-27T10:00:01.000Z',
    };
    const csv = eventsToCsv([event]);
    expect(csv.split('\n')[1]).toContain('"a,b""c"');
  });
});

describe('review masking', () => {
  it('masks a Korean resident registration number', () => {
    expect(maskText('주민등록번호 900101-1234567 입니다')).toBe(
      `주민등록번호 ${MASK} 입니다`,
    );
  });

  it('masks a phone number', () => {
    expect(maskText('연락처 02-1234-5678')).toBe(`연락처 ${MASK}`);
  });

  it('masks a long account-shaped number', () => {
    expect(maskText('계좌 1002-345-678901')).toContain(MASK);
    expect(maskText('계좌 1002345678901')).toContain(MASK);
  });

  it('masks an addressee name written with an honorific', () => {
    expect(maskText('홍길동 귀하')).toBe(`${MASK} 귀하`);
    expect(maskText('山田太郎 様')).toBe(`${MASK} 様`);
  });

  it('masks an email address', () => {
    expect(maskText('문의 test.user@example.com')).toBe(`문의 ${MASK}`);
  });

  it('leaves ordinary document text alone', () => {
    const text = '납부 기한은 2026년 9월 30일입니다.';
    expect(maskText(text)).toBe(text);
    expect(containsMaskablePii(text)).toBe(false);
  });

  it('detects text that still needs masking', () => {
    expect(containsMaskablePii('02-1234-5678')).toBe(true);
  });
});

describe('demo documents', () => {
  it('contain no real-looking phone number', () => {
    // Every demo contact must be an unusable 0000 pattern.
    for (const fixture of DOCUMENT_FIXTURES) {
      const analysis = fixture.analysisByLanguage.ko ?? fixture.analysisByLanguage.ja;
      for (const contact of analysis?.officialContacts ?? []) {
        if (!contact.phone) continue;
        expect(contact.phone).toMatch(/0000/);
      }
    }
  });

  it('contain no resident registration number anywhere on the page', () => {
    for (const fixture of DOCUMENT_FIXTURES) {
      const text = fixture.page.blocks.map((block) => block.text).join(' ');
      expect(text).not.toMatch(/\d{6}\s*-\s*\d{7}/);
    }
  });

  it('are labelled as synthetic on the page itself', () => {
    for (const fixture of DOCUMENT_FIXTURES) {
      const text = fixture.page.blocks.map((block) => block.text).join(' ');
      expect(text).toMatch(/합성문서|合成文書/);
    }
  });

  it('use placeholder agency names rather than a real office', () => {
    for (const fixture of DOCUMENT_FIXTURES) {
      const analysis = fixture.analysisByLanguage.ko ?? fixture.analysisByLanguage.ja;
      expect(analysis?.issuer ?? '').toMatch(/○○|△△/);
    }
  });
});
