import type { Metadata, Viewport } from 'next';

import { SessionProvider } from '@/lib/session/SessionProvider';
import { PreferencesSync } from '@/components/PreferencesSync';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Door',
  description:
    '받은 종이 통지서를 쉬운 말로 설명하고, 다음에 할 수 있는 행동을 보여주는 포용적 AI 시연용 웹 앱입니다.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom stays enabled. Locking it out would undo the accessibility work.
  maximumScale: 5,
  themeColor: '#9e2f61',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SessionProvider>
          <PreferencesSync />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
