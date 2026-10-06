import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flawless AceTouch - Request Skin Consultation',
  description: 'Online skin care consultations with vetted experts. Mock prototype.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
