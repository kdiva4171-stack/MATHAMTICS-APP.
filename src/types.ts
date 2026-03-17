export enum Language {
  EN = 'en',
  TE = 'te',
  HI = 'hi'
}

export enum DisplayMode {
  HALF = 'half',
  FULL = 'full'
}

export interface Settings {
  displayMode: DisplayMode;
  cardDuration: number; // 5, 10, 15, 20, 25
  strictMode: boolean;
  funPopups: boolean;
  popupInterval: number; // 2, 3, 5
  language: Language;
  audioCue: boolean;
  vibration: boolean;
  sessionDuration: number; // 5, 10, 15, 20, 30, 45, 60
  cardFrequency: number; // 0.5, 1, 2, 3, 5 (minutes)
}

export interface UserData {
  onboarded: boolean;
  trialStartedAt: number | null;
  hasAnyPremium: boolean;
  otpVerified: boolean;
  otpSkippedAt: number | null;
  settings: Settings;
}

export type Screen = 'onboarding_lang' | 'onboarding_privacy' | 'home' | 'settings' | 'premium' | 'about';
