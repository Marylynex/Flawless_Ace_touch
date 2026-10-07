import type { Metadata, Viewport } from 'next';
import './globals.css';
import RegisterSW from '../components/RegisterSW';

export const metadata: Metadata = {
  title: 'Flawless AceTouch - Request Skin Consultation',
  description: 'Online skin care consultations with vetted experts. Mock prototype.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'AceTouch' },
};

export const viewport: Viewport = {
  themeColor: '#2E7D6F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
