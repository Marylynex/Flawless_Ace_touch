import type { CapacitorConfig } from '@capacitor/cli';

// Live Netlify build: the app (UI + Next.js API routes for email,
// AI research and mock payments) runs on the server, so every feature
// works in the APK. An internet connection is required.
const config: CapacitorConfig = {
  appId: 'com.flawlessace.app',
  appName: 'Flawless AceTouch',
  webDir: 'www',
  server: {
    url: 'https://flawlessace.netlify.app',
    cleartext: false,
    androidScheme: 'https',
    allowNavigation: [
      'flawlessace.netlify.app',
      '*.netlify.app',
      '*.paystack.com',
      '*.paystack.co',
      'checkout.paystack.com',
    ],
  },
};

export default config;
