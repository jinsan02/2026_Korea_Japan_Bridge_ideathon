'use client';

/**
 * 나의 문서 매뉴얼 - step 2 of the learning loop.
 *
 * The durable output of solving a document: not "your tax was 86,400원" but the
 * order you check this KIND of paper in, and why each step matters. That is
 * what transfers to the next envelope.
 *
 * Manuals appear for document types the user has actually solved. Nothing here
 * contains personal data, and the screen says so.
 */
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { SpeakButton } from '@/components/SpeakButton';
import type { DocumentTypeId } from '@/lib/analysis/schema';
import {
  practiceFor,
  tutorialFor,
  tutorialsFor,
} from '@/lib/fixtures/learning-content';
import { readProgress } from '@/lib/learning/progress';
import { buildUtterance } from '@/lib/speech';
import { useSession } from '@/lib/session/SessionProvider';

function TutorialDetail({ documentType }: { documentType: DocumentTypeId }) {
  const { t, language, logEvent, conditionDefinition } = useSession();
  const tutorial = tutorialFor(documentType, language);
  const scenario = practiceFor(documentType, language);

  useEffect(() => {
    logEvent('tutorial_viewed', { screen: 'tutorial', documentType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentType]);

  if (!tutorial) {
    return (
      <AppShell screen="tutorial" backHref="/tutorial">
        <p className="notice notice--caution">
          <span className="notice__icon" aria-hidden="true">
            ⚠️
          </span>
          <span>{t.tutorial.empty}</span>
        </p>
      </AppShell>
    );
  }

  const spoken = buildUtterance([
    tutorial.title,
    tutorial.purpose,
    ...tutorial.checkOrder.map(
      (step) => `${step.order}번, ${step.title}. ${step.instruction}`,
    ),
  ]);

  return (
    <AppShell
      screen="tutorial"
      backHref="/tutorial"
      showBadges={false}
      footer={
        scenario ? (
          <Link
            className="btn btn--primary"
            href={`/practice?scenario=${encodeURIComponent(scenario.id)}`}
          >
            <span aria-hidden="true">✏️</span>
            {t.tutorial.practice}
          </Link>
        ) : undefined
      }
    >
      <div className="stack stack--loose">
        <h1 className="screen-title">{tutorial.title}</h1>

        <section className="card">
          <h2 className="section-heading">{t.tutorial.purpose}</h2>
          <p>{tutorial.purpose}</p>
        </section>

        {conditionDefinition.features.speech ? (
          <SpeakButton screen="tutorial" text={spoken} />
        ) : null}

        <section className="stack">
          <h2 className="section-heading">{t.tutorial.checkOrder}</h2>
          {tutorial.checkOrder.map((step) => (
            <div key={step.order} className="card">
              <span className="row">
                <span className="action-card__index" aria-hidden="true">
                  {step.order}
                </span>
                <span className="action-card__label">{step.title}</span>
              </span>
              <p>{step.instruction}</p>
              <p className="text-small">
                <strong>{t.tutorial.reason}</strong> {step.reason}
              </p>
              {step.exampleLabel ? (
                <p className="text-small">
                  <strong>{t.tutorial.exampleLabel}</strong>{' '}
                  <code>{step.exampleLabel}</code>
                </p>
              ) : null}
            </div>
          ))}
        </section>

        <section className="card">
          <h2 className="section-heading">{t.tutorial.keyTerms}</h2>
          {tutorial.keyTerms.map((term) => (
            <div key={term.term} className="field">
              <p className="field__label">{term.term}</p>
              <p>{term.easyExplanation}</p>
              {term.translatedTerm ? (
                <p className="text-small">
                  {t.tutorial.japaneseTerm}: {term.translatedTerm}
                </p>
              ) : null}
            </div>
          ))}
        </section>

        <section className="card">
          <h2 className="section-heading">
            <span aria-hidden="true">⚠️ </span>
            {t.tutorial.warnings}
          </h2>
          <ul>
            {tutorial.commonWarnings.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="section-heading">{t.tutorial.verification}</h2>
          <ol>
            {tutorial.officialVerificationGuide.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>

        <p className="notice notice--ok">
          <span className="notice__icon" aria-hidden="true">
            🔐
          </span>
          <span>{t.tutorial.privacyNote}</span>
        </p>
      </div>
    </AppShell>
  );
}

function TutorialList() {
  const { t, language } = useSession();
  const [learned, setLearned] = useState<DocumentTypeId[]>([]);

  useEffect(() => {
    setLearned(readProgress().learnedTypes);
  }, []);

  // Manuals the user has unlocked come first; the rest are shown as available
  // so the library does not look empty on a fresh install.
  const all = tutorialsFor(language);
  const unlocked = all.filter((tutorial) => learned.includes(tutorial.documentType));
  const others = all.filter((tutorial) => !learned.includes(tutorial.documentType));

  return (
    <AppShell screen="tutorial_list" backHref="/" showBadges={false}>
      <div className="stack stack--loose">
        <div className="stack stack--tight">
          <h1 className="screen-title">{t.tutorial.listTitle}</h1>
          <p className="screen-subtitle">{t.tutorial.listSubtitle}</p>
        </div>

        {unlocked.length === 0 ? (
          <div className="card">
            <p>{t.tutorial.empty}</p>
            <Link className="btn btn--primary" href="/capture">
              <span aria-hidden="true">📷</span>
              {t.tutorial.emptyAction}
            </Link>
          </div>
        ) : null}

        <div className="stack">
          {[...unlocked, ...others].map((tutorial) => (
            <Link
              key={tutorial.documentType}
              className="action-card"
              href={`/tutorial?type=${tutorial.documentType}`}
            >
              <span className="row">
                <span className="action-card__index" aria-hidden="true">
                  📘
                </span>
                <span className="action-card__label">{tutorial.title}</span>
              </span>
              <span className="action-card__description">{tutorial.purpose}</span>
            </Link>
          ))}
        </div>

        <p className="notice notice--ok">
          <span className="notice__icon" aria-hidden="true">
            🔐
          </span>
          <span>{t.tutorial.privacyNote}</span>
        </p>
      </div>
    </AppShell>
  );
}

function TutorialContent() {
  const params = useSearchParams();
  const type = params.get('type') as DocumentTypeId | null;
  return type ? <TutorialDetail documentType={type} /> : <TutorialList />;
}

export default function TutorialScreen() {
  return (
    <Suspense fallback={null}>
      <TutorialContent />
    </Suspense>
  );
}
