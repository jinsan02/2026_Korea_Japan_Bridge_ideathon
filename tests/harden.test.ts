/**
 * The safety rules are the part of this app that must not regress quietly.
 * These tests pin the behaviour that stops the UI stating something the
 * document never said.
 */
import { describe, expect, it } from 'vitest';

import { hardenAnalysis, needsSecondOpinion } from '@/lib/analysis/harden';
import type { ModelAnalysis } from '@/lib/analysis/schema';

function baseModel(overrides: Partial<ModelAnalysis> = {}): ModelAnalysis {
  return {
    language: 'ko',
    country: 'KR',
    documentType: 'tax_notice',
    documentTypeLabel: '지방세 납부 안내문',
    issuer: '서울 ○○구청',
    title: '지방세 납부 안내',
    summary: '재산세를 기한 안에 납부하라는 안내입니다.',
    importantDates: [
      {
        id: 'd1',
        label: '납부기한',
        isoDate: '2026-09-30',
        rawText: '2026년 9월 30일',
        kind: 'deadline',
        evidenceIds: ['e1'],
        confidence: 0.95,
      },
    ],
    amounts: [
      {
        id: 'a1',
        label: '납부 세액',
        value: 86400,
        currency: 'KRW',
        rawText: '86,400원',
        evidenceIds: ['e2'],
        confidence: 0.95,
      },
    ],
    recipientActions: [
      {
        id: 'ac1',
        title: '금액과 기한 확인하기',
        description: '고지서의 금액과 기한을 확인하세요.',
        deadline: '2026-09-30',
        requiredItems: [],
        method: ['표를 확인합니다.'],
        evidenceIds: ['e1'],
        confidence: 0.9,
      },
    ],
    paymentOptions: [],
    warnings: [],
    officialContacts: [
      {
        id: 'c1',
        organization: '서울 ○○구청',
        department: '세무과',
        phone: '02-0000-0000',
        url: null,
        hours: null,
        evidenceIds: ['e3'],
        source: 'document',
      },
    ],
    evidence: [
      { id: 'e1', originalText: '납부 기한: 2026년 9월 30일', explanation: '기한입니다.' },
      { id: 'e2', originalText: '납부 세액: 86,400원', explanation: '금액입니다.' },
      { id: 'e3', originalText: '전화 02-0000-0000', explanation: '문의처입니다.' },
    ],
    uncertainty: [],
    confidence: 0.95,
    requiresHumanVerification: false,
    ...overrides,
  };
}

const options = { language: 'ko' as const, isDemoMode: false };

describe('hardenAnalysis', () => {
  it('keeps a fully grounded analysis intact', () => {
    const result = hardenAnalysis(baseModel(), options);

    expect(result.importantDates[0].isoDate).toBe('2026-09-30');
    expect(result.amounts[0].value).toBe(86400);
    expect(result.officialContacts[0].phone).toBe('02-0000-0000');
    expect(result.requiresHumanVerification).toBe(false);
  });

  it('drops a date that no evidence supports', () => {
    const result = hardenAnalysis(
      baseModel({
        importantDates: [
          {
            id: 'd1',
            label: '납부기한',
            isoDate: '2026-09-30',
            rawText: '2026년 9월 30일',
            kind: 'deadline',
            evidenceIds: [],
            confidence: 0.95,
          },
        ],
      }),
      options,
    );

    // The raw text stays visible, but nothing downstream can treat it as a date.
    expect(result.importantDates[0].isoDate).toBeNull();
    expect(result.requiresHumanVerification).toBe(true);
    expect(result.warnings.some((w) => w.id === 'unverifiedDate')).toBe(true);
  });

  it('drops an amount that no evidence supports', () => {
    const result = hardenAnalysis(
      baseModel({
        amounts: [
          {
            id: 'a1',
            label: '납부 세액',
            value: 999999,
            currency: 'KRW',
            rawText: '999,999원',
            evidenceIds: [],
            confidence: 0.9,
          },
        ],
      }),
      options,
    );

    expect(result.amounts[0].value).toBeNull();
    expect(result.requiresHumanVerification).toBe(true);
  });

  it('removes a phone number the document did not contain', () => {
    const result = hardenAnalysis(
      baseModel({
        officialContacts: [
          {
            id: 'c1',
            organization: '서울 ○○구청',
            department: '세무과',
            phone: '02-1234-5678',
            url: 'https://example.invalid',
            hours: null,
            evidenceIds: [],
            source: 'document',
          },
        ],
      }),
      options,
    );

    expect(result.officialContacts[0].phone).toBeNull();
    expect(result.officialContacts[0].url).toBeNull();
    expect(result.officialContacts[0].source).toBe('not_found');
    // The organisation name survives so the UI can still say where to look.
    expect(result.officialContacts[0].organization).toBe('서울 ○○구청');
  });

  it('rejects an evidence id that points at nothing', () => {
    const result = hardenAnalysis(
      baseModel({
        importantDates: [
          {
            id: 'd1',
            label: '납부기한',
            isoDate: '2026-09-30',
            rawText: '2026년 9월 30일',
            kind: 'deadline',
            evidenceIds: ['does-not-exist'],
            confidence: 0.95,
          },
        ],
      }),
      options,
    );

    expect(result.importantDates[0].evidenceIds).toEqual([]);
    expect(result.importantDates[0].isoDate).toBeNull();
  });

  it('never shows more than three action cards', () => {
    const action = baseModel().recipientActions[0];
    const result = hardenAnalysis(
      baseModel({
        recipientActions: [
          { ...action, id: 'a' },
          { ...action, id: 'b' },
          { ...action, id: 'c' },
          { ...action, id: 'd' },
          { ...action, id: 'e' },
        ],
      }),
      options,
    );

    expect(result.recipientActions).toHaveLength(3);
  });

  it('rejects a non-http official URL', () => {
    const result = hardenAnalysis(
      baseModel({
        officialContacts: [
          {
            id: 'c1',
            organization: '서울 ○○구청',
            department: null,
            phone: null,
            url: 'javascript:alert(1)',
            hours: null,
            evidenceIds: ['e3'],
            source: 'document',
          },
        ],
      }),
      options,
    );

    expect(result.officialContacts[0].url).toBeNull();
  });

  it('forces human verification for a court document', () => {
    const result = hardenAnalysis(
      baseModel({ documentType: 'court_notice', documentTypeLabel: '법원 문서' }),
      options,
    );

    expect(result.requiresHumanVerification).toBe(true);
    expect(result.warnings.some((w) => w.id === 'courtDocument')).toBe(true);
  });

  it('adds the medical caution for a health notice', () => {
    const result = hardenAnalysis(
      baseModel({ documentType: 'health_checkup', documentTypeLabel: '건강검진 안내문' }),
      options,
    );

    expect(result.warnings.some((w) => w.id === 'medicalDocument')).toBe(true);
  });

  it('caps confidence when there is no evidence at all', () => {
    const result = hardenAnalysis(
      baseModel({ evidence: [], confidence: 0.99 }),
      options,
    );

    expect(result.confidence).toBeLessThanOrEqual(0.3);
    expect(result.requiresHumanVerification).toBe(true);
  });

  it('announces demo mode as a warning', () => {
    const result = hardenAnalysis(baseModel(), { language: 'ko', isDemoMode: true });
    expect(result.warnings.some((w) => w.id === 'demoMode')).toBe(true);
  });

  it('always states that it never pays on the user behalf for a tax notice', () => {
    const result = hardenAnalysis(baseModel(), options);
    expect(result.warnings.some((w) => w.id === 'neverPays')).toBe(true);
  });
});

describe('needsSecondOpinion', () => {
  it('does not ask for one when the analysis is clean', () => {
    const analysis = hardenAnalysis(baseModel(), options);
    expect(needsSecondOpinion(analysis).needed).toBe(false);
  });

  it('asks when the document type is unknown', () => {
    const analysis = hardenAnalysis(
      baseModel({ documentType: 'unknown', documentTypeLabel: '알 수 없음' }),
      options,
    );
    expect(needsSecondOpinion(analysis).needed).toBe(true);
  });

  it('asks when the same label carries two different dates', () => {
    const analysis = hardenAnalysis(
      baseModel({
        importantDates: [
          {
            id: 'd1',
            label: '납부기한',
            isoDate: '2026-09-30',
            rawText: '9월 30일',
            kind: 'deadline',
            evidenceIds: ['e1'],
            confidence: 0.9,
          },
          {
            id: 'd2',
            label: '납부기한',
            isoDate: '2026-10-31',
            rawText: '10월 31일',
            kind: 'deadline',
            evidenceIds: ['e1'],
            confidence: 0.9,
          },
        ],
      }),
      options,
    );

    expect(needsSecondOpinion(analysis)).toEqual({
      needed: true,
      reason: 'conflicting_values',
    });
  });

  it('asks when confidence is low', () => {
    const analysis = hardenAnalysis(baseModel({ confidence: 0.4 }), options);
    expect(needsSecondOpinion(analysis).needed).toBe(true);
  });
});
