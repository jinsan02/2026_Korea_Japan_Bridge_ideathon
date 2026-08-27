'use client';

/**
 * Official contact.
 *
 * Only a number that appeared in the document is shown, and dialling asks for
 * confirmation first. When the document had no contact details the screen says
 * so and teaches how to find the real number safely - a fabricated "official"
 * phone number is a phishing vector, so guessing is not an option.
 *
 * The "what to ask" list exists because knowing the number is not the same as
 * knowing how to start the call.
 */
import Link from 'next/link';
import { useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { RequireAnalysis } from '@/components/RequireAnalysis';
import { SpeakButton } from '@/components/SpeakButton';
import { HumanReviewNotice } from '@/components/WarningList';
import { tutorialFor } from '@/lib/fixtures/learning-content';
import { buildUtterance } from '@/lib/speech';
import { useSession } from '@/lib/session/SessionProvider';

export default function ContactScreen() {
  const { t, language, logEvent, conditionDefinition } = useSession();
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <RequireAnalysis screen="contact">
      {(analysis) => {
        const contacts = analysis.officialContacts.filter(
          (contact) => contact.source === 'document',
        );
        const tutorial = tutorialFor(analysis.documentType, language);

        return (
          <AppShell
            screen="contact"
            backHref="/result"
            footer={
              conditionDefinition.features.learningLoop ? (
                <Link className="btn btn--secondary" href="/solve/complete">
                  <span aria-hidden="true">✏️</span>
                  {t.result.practiceSimilar}
                </Link>
              ) : undefined
            }
          >
            <div className="stack stack--loose">
              <div className="stack stack--tight">
                <h1 className="screen-title">{t.contact.title}</h1>
                <p className="screen-subtitle">{t.contact.subtitle}</p>
              </div>

              <HumanReviewNotice />

              {contacts.length === 0 ? (
                <div className="notice notice--caution">
                  <span className="notice__icon" aria-hidden="true">
                    ❓
                  </span>
                  <span>
                    <strong>{t.contact.noneTitle}</strong>
                    <br />
                    {t.contact.noneBody}
                  </span>
                </div>
              ) : null}

              {contacts.map((contact) => (
                <section key={contact.id} className="card">
                  <div className="field">
                    <p className="field__label">{t.contact.organization}</p>
                    <p className="field__value">{contact.organization}</p>
                  </div>
                  {contact.department ? (
                    <div className="field">
                      <p className="field__label">{t.contact.department}</p>
                      <p className="field__value">{contact.department}</p>
                    </div>
                  ) : null}
                  {contact.phone ? (
                    <div className="field">
                      <p className="field__label">{t.contact.phone}</p>
                      <p className="field__value">{contact.phone}</p>
                    </div>
                  ) : null}
                  {contact.hours ? (
                    <div className="field">
                      <p className="field__label">{t.contact.hours}</p>
                      <p className="field__value">{contact.hours}</p>
                    </div>
                  ) : null}

                  {contact.phone ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => {
                          setConfirming(contact.id);
                          logEvent('call_confirm_shown', { screen: 'contact' });
                        }}
                      >
                        <span aria-hidden="true">☎</span>
                        {t.contact.call}
                      </button>

                      {confirming === contact.id ? (
                        <div className="card card--flat" role="dialog" aria-modal="false">
                          <h2 className="section-heading">
                            {t.contact.callConfirmTitle}
                          </h2>
                          <p>{t.contact.callConfirmBody(contact.phone)}</p>
                          <a
                            className="btn btn--primary"
                            href={`tel:${contact.phone.replace(/\s/g, '')}`}
                            onClick={() =>
                              logEvent('official_contact_viewed', { screen: 'contact' })
                            }
                          >
                            {t.contact.call}
                          </a>
                          <button
                            type="button"
                            className="btn btn--quiet"
                            onClick={() => setConfirming(null)}
                          >
                            {t.common.cancel}
                          </button>
                        </div>
                      ) : null}
                    </>
                  ) : null}

                  {contact.url ? (
                    <a
                      className="btn btn--secondary"
                      href={contact.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span aria-hidden="true">🌐</span>
                      {t.contact.openSite}
                    </a>
                  ) : null}
                </section>
              ))}

              {tutorial ? (
                <>
                  <section className="card card--flat">
                    <h2 className="section-heading">{t.contact.askTitle}</h2>
                    <ul>
                      {tutorial.officialVerificationGuide.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="card card--flat">
                    <h2 className="section-heading">{t.contact.howToFindTitle}</h2>
                    <ul>
                      {tutorial.commonWarnings.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : null}

              {conditionDefinition.features.speech ? (
                <SpeakButton
                  screen="contact"
                  text={buildUtterance([
                    t.contact.title,
                    ...contacts.map((contact) =>
                      contact.phone
                        ? `${contact.organization}, ${t.contact.phone} ${contact.phone}`
                        : contact.organization,
                    ),
                    contacts.length === 0 ? t.contact.noneBody : null,
                    ...(tutorial?.officialVerificationGuide ?? []),
                  ])}
                />
              ) : null}
            </div>
          </AppShell>
        );
      }}
    </RequireAnalysis>
  );
}
