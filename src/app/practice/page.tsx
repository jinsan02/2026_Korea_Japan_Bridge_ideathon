'use client';

/**
 * 혼자 해보기 - steps 3 and 4 of the learning loop.
 *
 * The rule this screen exists to enforce: the user answers FIRST. The app does
 * not open with the answer, and hints only arrive when asked for, in a fixed
 * order - where to look, which word, then the evidence and the answer.
 *
 * Assistance fades with the level recorded for this document type:
 *   guided     - the location hint is already on screen
 *   hinted     - answer first, hints on request
 *   solo       - answer first, no hints; feedback after submitting
 *   final_check- same as solo, and the app only confirms what was missed
 *
 * Nothing here is scored or graded. The counters exist to fade assistance and
 * to show the user what to look at next time.
 */
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { DocumentPageView } from '@/components/DocumentPageView';
import { SpeakButton } from '@/components/SpeakButton';
import {
  PRACTICE_PAGES,
  PRACTICE_SCENARIOS,
} from '@/lib/fixtures/practice';
import { practiceById } from '@/lib/fixtures/learning-content';
import { blockToBBox, findBlock } from '@/lib/fixtures/document-page';
import {
  assistanceLevelFor,
  readProgress,
  recordPractice,
} from '@/lib/learning/progress';
import type {
  AssistanceLevel,
  PracticeQuestion,
  PracticeScenario,
  QuestionOutcome,
} from '@/lib/learning/types';
import { NEXT_LEVEL } from '@/lib/learning/types';
import { buildUtterance } from '@/lib/speech';
import { useSession } from '@/lib/session/SessionProvider';

const JA_SCENARIO_LABELS: Record<string, { title: string; topic: string }> = {
  'practice-kr-tax-auto': {
    title: '自動車税の お知らせで 練習',
    topic: '地方税の 書類で 期限と 払い方を 探します',
  },
  'practice-jp-health': {
    title: '健康診断の お知らせで 練習',
    topic: '予約期限と 準備する 物を 探します',
  },
  'practice-kr-welfare': {
    title: '福祉の お知らせで 練習',
    topic: '申請期限と 準備する 物を 探します',
  },
};

function scenarioLabel(scenario: PracticeScenario, language: string) {
  return language === 'ja' ? JA_SCENARIO_LABELS[scenario.id] : undefined;
}

/** Hint 1 is pre-revealed at the most supported level. */
function initialHintStep(level: AssistanceLevel): number {
  return level === 'guided' ? 1 : 0;
}

function hintsAvailable(level: AssistanceLevel): boolean {
  return level === 'guided' || level === 'hinted';
}

function PracticeChooser() {
  const { t, language } = useSession();
  const [learned, setLearned] = useState<string[]>([]);

  useEffect(() => {
    setLearned(readProgress().learnedTypes);
  }, []);

  return (
    <AppShell screen="practice_choose" backHref="/" showBadges={false}>
      <div className="stack stack--loose">
        <div className="stack stack--tight">
          <h1 className="screen-title">{t.practice.chooseTitle}</h1>
          <p className="screen-subtitle">{t.practice.subtitle}</p>
        </div>

        <div className="stack">
          {PRACTICE_SCENARIOS.map((scenario) => {
            const label = scenarioLabel(scenario, language);
            return (
              <Link
                key={scenario.id}
                className="action-card"
                href={`/practice?scenario=${encodeURIComponent(scenario.id)}`}
              >
                <span className="row">
                  <span className="action-card__index" aria-hidden="true">
                    ✏️
                  </span>
                  <span className="action-card__label">{label?.title ?? scenario.title}</span>
                </span>
                <span className="action-card__description">
                  {label?.topic ?? scenario.topic}
                  {learned.includes(scenario.documentType) ? ' · ✅' : ''}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function PracticeSession({ scenario }: { scenario: PracticeScenario }) {
  const router = useRouter();
  const { t, language, logEvent, conditionDefinition } = useSession();
  const displayLabel = scenarioLabel(scenario, language);

  const [level, setLevel] = useState<AssistanceLevel>('guided');
  const [phase, setPhase] = useState<'intro' | 'quiz'>('intro');
  const [index, setIndex] = useState(0);
  const [hintStep, setHintStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<QuestionOutcome[]>([]);
  const hintsThisQuestion = useRef(0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const current = assistanceLevelFor(scenario.documentType);
    setLevel(current);
    setHintStep(initialHintStep(current));
    logEvent('practice_started', {
      screen: 'practice',
      scenarioId: scenario.id,
      documentType: scenario.documentType,
      assistanceLevel: current,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id]);

  const page = PRACTICE_PAGES[scenario.pageId];
  const question: PracticeQuestion | undefined = scenario.questions[index];

  const highlight = useMemo(() => {
    if (!question || !page) return null;
    // The region is only revealed from hint 2 onwards - pointing at the answer
    // before the user has tried is the failure mode this whole screen avoids.
    if (hintStep < 2) return null;
    const blockId = question.hints.highlightBlockId;
    if (!blockId) return null;
    try {
      return blockToBBox(page, findBlock(page, blockId));
    } catch {
      return null;
    }
  }, [question, page, hintStep]);

  if (!page || !question) return null;

  const answered = picked !== null;
  const chosen = answered ? question.options[picked] : null;
  const isCorrect = chosen?.correct === true;
  const isLast = index === scenario.questions.length - 1;

  const requestHint = () => {
    const next = Math.min(3, hintStep + 1);
    if (next === hintStep) return;
    setHintStep(next);
    hintsThisQuestion.current += 1;
    logEvent('practice_hint', {
      screen: 'practice',
      scenarioId: scenario.id,
      questionId: question.id,
      hintStep: next,
    });
    if (next === 3) {
      logEvent('practice_answer_revealed', {
        screen: 'practice',
        scenarioId: scenario.id,
        questionId: question.id,
      });
    }
  };

  const submit = (optionIndex: number) => {
    setPicked(optionIndex);
    const correct = question.options[optionIndex].correct;
    logEvent('practice_answer', {
      screen: 'practice',
      scenarioId: scenario.id,
      questionId: question.id,
      optionIndex,
      isCorrect: correct,
      hintStep,
      independent: correct && hintsThisQuestion.current === 0,
    });
  };

  const retry = () => setPicked(null);

  const nextQuestion = () => {
    const correct = chosen?.correct === true;
    const outcome: QuestionOutcome = {
      questionId: question.id,
      correct,
      // `independent` stays strict: at the guided level hint 1 is on screen
      // before the answer, so the app did give something away and says so.
      independent:
        correct && hintsThisQuestion.current === 0 && initialHintStep(level) === 0,
      hintsUsed: hintsThisQuestion.current + initialHintStep(level),
      // Fading is judged on this instead - what the user actually asked for.
      hintsRequested: hintsThisQuestion.current,
    };
    const allOutcomes = [...outcomes, outcome];
    setOutcomes(allOutcomes);

    if (!isLast) {
      setIndex((current) => current + 1);
      setPicked(null);
      setHintStep(initialHintStep(level));
      hintsThisQuestion.current = 0;
      return;
    }

    const record = {
      id: `p-${Date.now().toString(36)}`,
      scenarioId: scenario.id,
      documentType: scenario.documentType,
      assistanceLevel: level,
      completedAt: new Date().toISOString(),
      outcomes: allOutcomes,
      durationMs: Date.now() - startedAt.current,
    };
    const after = recordPractice(record);
    const newLevel = after.levels[scenario.documentType] ?? level;

    logEvent('practice_completed', {
      screen: 'practice',
      scenarioId: scenario.id,
      documentType: scenario.documentType,
      assistanceLevel: level,
      questionCount: allOutcomes.length,
      independentCount: allOutcomes.filter((item) => item.independent).length,
      hintsUsed: allOutcomes.reduce((sum, item) => sum + item.hintsUsed, 0),
      durationMs: record.durationMs,
    });
    if (newLevel !== level) {
      logEvent('assistance_level_changed', {
        screen: 'practice',
        documentType: scenario.documentType,
        assistanceLevel: newLevel,
      });
    }

    router.push('/practice/result');
  };

  if (phase === 'intro') {
    return (
      <AppShell
        screen="practice_intro"
        backHref="/practice"
        showBadges={false}
        footer={
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              startedAt.current = Date.now();
              setPhase('quiz');
            }}
          >
            {t.practice.yourTurnTitle}
          </button>
        }
      >
        <div className="stack stack--loose">
          <div className="stack stack--tight">
            <h1 className="screen-title">{displayLabel?.title ?? scenario.title}</h1>
            <p className="screen-subtitle">{t.practice.yourTurnBody}</p>
          </div>

          <div className="badge-row">
            <span className="badge badge--synthetic">
              <span aria-hidden="true">🧪</span>
              {t.practice.syntheticNotice}
            </span>
            <span className="badge badge--synthetic">
              <span aria-hidden="true">🔒</span>
              {t.practice.maskedNotice}
            </span>
          </div>

          <section className="card card--flat">
            <p className="field__label">{t.practice.levelTitle}</p>
            <p className="field__value">{t.practice.levels[level]}</p>
            <p className="text-small">{t.practice.levelHelp[level]}</p>
            {NEXT_LEVEL[level] !== level ? (
              <p className="text-small">{t.practice.fadeNotice}</p>
            ) : null}
          </section>

          <div className="doc-scroll">
            <DocumentPageView page={page} label={displayLabel?.title ?? scenario.title} mask />
          </div>
        </div>
      </AppShell>
    );
  }

  const spoken = buildUtterance([
    question.prompt,
    ...question.options.map((option, position) => `${position + 1}번, ${option.text}`),
  ]);

  return (
    <AppShell
      screen="practice_quiz"
      backHref="/practice"
      showBadges={false}
      step={{ current: index + 1, total: scenario.questions.length }}
      footer={
        answered ? (
          isCorrect || hintStep >= 3 ? (
            <button type="button" className="btn btn--primary" onClick={nextQuestion}>
              {isLast ? t.practice.finish : t.practice.nextQuestion}
            </button>
          ) : (
            <>
              <button type="button" className="btn btn--secondary" onClick={retry}>
                {t.practice.tryAgain}
              </button>
              {hintsAvailable(level) ? (
                <button type="button" className="btn btn--quiet" onClick={requestHint}>
                  {t.practice.needHint}
                </button>
              ) : (
                <button type="button" className="btn btn--quiet" onClick={nextQuestion}>
                  {isLast ? t.practice.finish : t.practice.nextQuestion}
                </button>
              )}
            </>
          )
        ) : hintsAvailable(level) && hintStep < 3 ? (
          <button type="button" className="btn btn--quiet" onClick={requestHint}>
            <span aria-hidden="true">💡</span>
            {t.practice.needHint}
          </button>
        ) : undefined
      }
    >
      <div className="stack stack--loose">
        <p className="text-small">
          {t.practice.questionCount(index + 1, scenario.questions.length)} ·{' '}
          {t.practice.levels[level]}
        </p>

        <h1 className="screen-title">{question.prompt}</h1>

        {conditionDefinition.features.speech ? (
          <SpeakButton screen="practice" text={spoken} />
        ) : null}

        <div className="stack stack--tight">
          {question.options.map((option, position) => {
            const state =
              !answered || picked !== position
                ? undefined
                : option.correct
                  ? 'correct'
                  : 'incorrect';
            return (
              <button
                key={option.text}
                type="button"
                className="option"
                data-state={state}
                disabled={answered && (isCorrect || hintStep >= 3)}
                onClick={() => submit(position)}
              >
                <span className="option__mark" aria-hidden="true">
                  {state === 'correct' ? '✅' : state === 'incorrect' ? '❌' : '○'}
                </span>
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>

        {answered && chosen ? (
          <div className={`notice notice--${isCorrect ? 'ok' : 'caution'}`} role="status">
            <span className="notice__icon" aria-hidden="true">
              {isCorrect ? '✅' : '🔎'}
            </span>
            <span>
              <strong>{isCorrect ? t.practice.correct : t.practice.incorrect}</strong>
              <br />
              {chosen.feedback}
            </span>
          </div>
        ) : null}

        {hintStep >= 1 ? (
          <div className="card card--flat">
            <p className="field__label">
              {t.practice.hintLabel(1)} · {t.practice.hintLocation}
            </p>
            <p>{question.hints.location}</p>
          </div>
        ) : null}
        {hintStep >= 2 ? (
          <div className="card card--flat">
            <p className="field__label">
              {t.practice.hintLabel(2)} · {t.practice.hintKeyword}
            </p>
            <p>{question.hints.keyword}</p>
          </div>
        ) : null}
        {hintStep >= 3 ? (
          <div className="card card--flat">
            <p className="field__label">
              {t.practice.hintLabel(3)} · {t.practice.hintAnswer}
            </p>
            <p>{question.hints.answer}</p>
          </div>
        ) : null}

        {(isCorrect || hintStep >= 3) && answered ? (
          <div className="card card--flat">
            <p className="field__label">{t.practice.why}</p>
            <p>{question.explanation}</p>
          </div>
        ) : null}

        <div className="doc-scroll">
          <DocumentPageView
            page={page}
            highlight={highlight}
            label={displayLabel?.title ?? scenario.title}
            mask
          />
        </div>
      </div>
    </AppShell>
  );
}

function PracticeContent() {
  const params = useSearchParams();
  const scenarioId = params.get('scenario');
  const { language } = useSession();
  const scenario = scenarioId ? practiceById(scenarioId, language) : undefined;
  return scenario ? <PracticeSession scenario={scenario} /> : <PracticeChooser />;
}

export default function PracticeScreen() {
  return (
    <Suspense fallback={null}>
      <PracticeContent />
    </Suspense>
  );
}
