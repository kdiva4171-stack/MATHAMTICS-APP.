/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Share2, 
  Mail, 
  MessageSquare, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  WifiOff, 
  Users, 
  Lock, 
  Star,
  X,
  Play,
  Square,
  Plus,
  Minus,
  X as CloseIcon,
  Divide
} from 'lucide-react';
import { Language, DisplayMode, Screen, UserData, Settings } from './types';
import { TRANSLATIONS, INITIAL_USER_DATA, DEFAULT_SETTINGS } from './constants';
import { useDoubleTap } from './hooks/useDoubleTap';

// --- Components ---

const Badge = ({ 
  isActive, 
  trialDays, 
  onDoubleTap 
}: { 
  isActive: boolean; 
  trialDays: number; 
  onDoubleTap: () => void 
}) => {
  const doubleTap = useDoubleTap(onDoubleTap);

  return (
    <div className="relative cursor-pointer select-none" onClick={doubleTap}>
      <motion.div
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
          isActive ? 'bg-indigo-600' : 'bg-indigo-500'
        }`}
      >
        QM
        {isActive && (
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"
          />
        )}
      </motion.div>
      {trialDays > 0 && (
        <div className="absolute -top-2 -left-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
          {trialDays}d
        </div>
      )}
    </div>
  );
};

const MathCard = ({ 
  settings, 
  onClose, 
  onAnswer 
}: { 
  settings: Settings; 
  onClose: () => void; 
  onAnswer: (correct: boolean) => void 
}) => {
  const [timeLeft, setTimeLeft] = useState(settings.cardDuration);
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+', ans: 0, options: [] as number[] });

  useEffect(() => {
    const ops = ['+', '-', '*', '/'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;
    if (op === '+') { a = Math.floor(Math.random() * 20); b = Math.floor(Math.random() * 20); ans = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * a); ans = a - b; }
    else if (op === '*') { a = Math.floor(Math.random() * 10); b = Math.floor(Math.random() * 10); ans = a * b; }
    else { b = Math.floor(Math.random() * 9) + 1; ans = Math.floor(Math.random() * 10); a = b * ans; }

    const options = [ans];
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = ans + (offset === 0 ? 1 : offset);
      if (wrong >= 0 && !options.includes(wrong)) options.push(wrong);
    }
    setQuestion({ a, b, op, ans, options: options.sort(() => Math.random() - 0.5) });
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onAnswer(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onAnswer]);

  const progress = (timeLeft / settings.cardDuration) * 100;
  const color = timeLeft < 5 ? '#ef4444' : '#6366f1';

  const isFull = settings.displayMode === DisplayMode.FULL;

  return (
    <motion.div 
      initial={{ y: 500 }}
      animate={{ y: 0 }}
      exit={{ y: 500 }}
      className={`fixed left-0 right-0 bg-white shadow-2xl z-50 rounded-t-3xl border-t border-gray-100 flex flex-col items-center p-6 ${
        isFull ? 'top-0 bottom-0 h-full' : 'bottom-0 h-[45%]'
      }`}
    >
      <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-6" />
      
      <div className="w-full flex justify-between items-center mb-8 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">QM</div>
          <span className="text-indigo-600 font-bold text-xs tracking-widest uppercase">Quick Math</span>
        </div>
        
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" stroke="#f3f4f6" strokeWidth="4" />
            <motion.circle 
              cx="28" cy="28" r="24" fill="none" 
              stroke={color} strokeWidth="4" 
              strokeDasharray="150.8"
              animate={{ strokeDashoffset: 150.8 - (150.8 * progress) / 100 }}
            />
          </svg>
          <span className="text-xl font-bold" style={{ color }}>{timeLeft}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <p className="text-gray-400 font-medium mb-4">Think quick!</p>
        <h2 className={`${isFull ? 'text-7xl' : 'text-5xl'} font-bold mb-12`}>
          {question.a} {question.op === '*' ? '×' : question.op === '/' ? '÷' : question.op} {question.b} = ?
        </h2>

        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(opt === question.ans)}
              className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 flex items-center gap-4 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-indigo-100 text-gray-400 group-hover:text-indigo-600 flex items-center justify-center font-bold text-sm">
                {String.fromCharCode(65 + i)}
              </div>
              <span className="text-xl font-bold text-gray-800">{opt}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const FunPopup = ({ type, onClose }: { type: 'A' | 'B'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 20000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#09090F] z-[60] flex items-center justify-center overflow-hidden"
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white z-[70]">
        <X size={32} />
      </button>

      {type === 'A' ? (
        <div className="relative w-full h-full">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                width: 200 + Math.random() * 300,
                height: 200 + Math.random() * 300,
                backgroundColor: ['#6366f1', '#a855f7', '#ec4899'][i % 3],
                left: `${Math.random() * 80}%`,
                top: `${Math.random() * 80}%`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="text-white/30 text-2xl font-light tracking-widest uppercase">Mental Break</h3>
          </div>
        </div>
      ) : (
        <div className="relative w-80 h-80 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="absolute w-full h-full border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            className="absolute w-3/4 h-3/4 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
            className="absolute w-1/2 h-1/2 border-4 border-pink-500/30 border-t-pink-500 rounded-full"
          />
          <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.8)]" />
        </div>
      )}
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem('quick_math_user');
    return saved ? JSON.parse(saved) : INITIAL_USER_DATA;
  });

  const [screen, setScreen] = useState<Screen>(() => {
    if (!userData.onboarded) return 'onboarding_lang';
    return 'home';
  });

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showMathCard, setShowMathCard] = useState(false);
  const [showFunPopup, setShowFunPopup] = useState(false);
  const [cardsShown, setCardsShown] = useState(0);
  const [tempSettings, setTempSettings] = useState<Settings | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showUPIDialog, setShowUPIDialog] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const t = TRANSLATIONS[userData.settings.language];

  // Persist user data
  useEffect(() => {
    localStorage.setItem('quick_math_user', JSON.stringify(userData));
  }, [userData]);

  // Trial Logic
  useEffect(() => {
    if (userData.trialStartedAt) {
      const now = Date.now();
      const diff = now - userData.trialStartedAt;
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      
      if (diff > threeDays && userData.hasAnyPremium) {
        setUserData(prev => ({ ...prev, hasAnyPremium: false }));
      }
    }
  }, [userData.trialStartedAt, userData.hasAnyPremium]);

  const trialDaysLeft = useMemo(() => {
    if (!userData.trialStartedAt) return 0;
    const now = Date.now();
    const diff = now - userData.trialStartedAt;
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const left = threeDays - diff;
    return Math.max(0, Math.ceil(left / (24 * 60 * 60 * 1000)));
  }, [userData.trialStartedAt]);

  // Session Logic
  useEffect(() => {
    let interval: any;
    if (isSessionActive && !showMathCard && !showFunPopup) {
      interval = setInterval(() => {
        setShowMathCard(true);
      }, userData.settings.cardFrequency * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, showMathCard, showFunPopup, userData.settings.cardFrequency]);

  const toggleSession = useCallback(() => {
    setIsSessionActive(prev => !prev);
    if (isSessionActive) {
      setShowMathCard(false);
      setShowFunPopup(false);
    }
  }, [isSessionActive]);

  const handleAnswer = (correct: boolean) => {
    setShowMathCard(false);
    const newCount = cardsShown + 1;
    setCardsShown(newCount);

    if (userData.settings.funPopups && newCount % userData.settings.popupInterval === 0) {
      setTimeout(() => setShowFunPopup(true), 500);
    }
  };

  // --- Renderers ---

  const renderOnboardingLang = () => (
    <div className="min-h-screen bg-white p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">QM</div>
        <h1 className="text-2xl font-bold">Quick Math</h1>
      </div>
      
      <h2 className="text-5xl font-bold mb-4 leading-tight">{t.chooseLanguage}</h2>
      <p className="text-gray-500 text-lg mb-12">{t.pickLanguage}</p>

      <div className="space-y-4 flex-1">
        {[
          { id: Language.EN, label: 'English', sub: 'English', flag: '🇬🇧' },
          { id: Language.TE, label: 'తెలుగు', sub: 'Telugu', flag: '🇮🇳' },
          { id: Language.HI, label: 'हिंदी', sub: 'Hindi', flag: '🇮🇳' }
        ].map(lang => (
          <button
            key={lang.id}
            onClick={() => setUserData(prev => ({ ...prev, settings: { ...prev.settings, language: lang.id } }))}
            className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${
              userData.settings.language === lang.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{lang.flag}</span>
              <div className="text-left">
                <div className="font-bold text-xl">{lang.label}</div>
                <div className="text-gray-400 text-sm">{lang.sub}</div>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              userData.settings.language === lang.id ? 'border-indigo-500' : 'border-gray-200'
            }`}>
              {userData.settings.language === lang.id && <div className="w-3 h-3 bg-indigo-500 rounded-full" />}
            </div>
          </button>
        ))}
      </div>

      <button 
        onClick={() => setScreen('onboarding_privacy')}
        className="w-full py-5 bg-indigo-300 text-white rounded-full font-bold text-xl mt-8 shadow-lg shadow-indigo-100"
      >
        {t.continue}
      </button>
    </div>
  );

  const renderOnboardingPrivacy = () => (
    <div className="min-h-screen bg-white p-8 flex flex-col items-center text-center">
      <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-12 mt-12">
        <ShieldCheck size={48} className="text-indigo-600" />
      </div>

      <h2 className="text-4xl font-bold mb-4">{t.privacyMatters}</h2>
      <p className="text-gray-500 text-lg mb-12 px-8">{t.privacyDesc}</p>

      <div className="space-y-4 w-full flex-1">
        {[
          { icon: <WifiOff size={24} />, text: t.offline },
          { icon: <Users size={24} />, text: t.ageLimit },
          { icon: <ShieldCheck size={24} />, text: t.noData }
        ].map((item, i) => (
          <div key={i} className="w-full p-6 rounded-3xl border-2 border-gray-50 flex items-center gap-4 bg-gray-50/30">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
              {item.icon}
            </div>
            <span className="text-left font-semibold text-gray-700">{item.text}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          setUserData(prev => ({ 
            ...prev, 
            onboarded: true, 
            trialStartedAt: Date.now(),
            hasAnyPremium: true 
          }));
          setScreen('home');
        }}
        className="w-full py-5 bg-indigo-600 text-white rounded-full font-bold text-xl mt-8 shadow-xl shadow-indigo-200"
      >
        {t.acceptContinue}
      </button>
    </div>
  );

  const renderHome = () => (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Badge isActive={isSessionActive} trialDays={trialDaysLeft} onDoubleTap={toggleSession} />
          <div>
            <h1 className="text-2xl font-bold">Quick Math</h1>
            <p className="text-xs text-gray-400">
              {isSessionActive ? t.doubleTapToStop : t.doubleTapToStart}
            </p>
          </div>
        </div>
        <button onClick={() => { setTempSettings({ ...userData.settings }); setScreen('settings'); }} className="p-2 bg-gray-50 rounded-xl text-gray-500">
          <SettingsIcon size={24} />
        </button>
      </div>

      {userData.hasAnyPremium && trialDaysLeft > 0 && (
        <div className="bg-indigo-50 p-5 rounded-3xl mb-4 border border-indigo-100 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
            <Star size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-indigo-900">{t.trialActive.replace('{days}', trialDaysLeft.toString())}</h3>
            <p className="text-xs text-indigo-700/70 mt-1">{t.trialDesc}</p>
          </div>
          <button onClick={() => setScreen('premium')} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md">
            {t.upgrade}
          </button>
        </div>
      )}

      <div className="bg-amber-50 p-5 rounded-3xl mb-6 border border-amber-100 flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl text-amber-600 shadow-sm">
          <Info size={20} />
        </div>
        <p className="text-xs text-amber-900 font-medium leading-relaxed">{t.overlayPermission}</p>
      </div>

      <div className="space-y-3 mb-8">
        <button onClick={() => setShowDurationPicker(true)} className="w-full p-5 bg-gray-50 rounded-3xl flex justify-between items-center group">
          <span className="text-gray-500 font-medium">{t.sessionDuration}</span>
          <span className="text-indigo-600 font-bold underline underline-offset-4">{userData.settings.sessionDuration} min</span>
        </button>
        <div className="w-full p-5 bg-gray-50 rounded-3xl flex justify-between items-center">
          <span className="text-gray-500 font-medium">{t.oneCardEvery}</span>
          <span className="text-indigo-600 font-bold underline underline-offset-4">{userData.settings.cardFrequency} min</span>
        </div>
        <div className="w-full p-5 bg-gray-50 rounded-3xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-gray-400" />
            <span className="text-gray-500 font-medium">{t.strictMode}</span>
            <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{t.premium}</span>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${userData.settings.strictMode ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${userData.settings.strictMode ? 'translate-x-6' : ''}`} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <button 
          onClick={toggleSession}
          className={`w-full py-6 rounded-full flex items-center justify-center gap-4 text-xl font-bold transition-all shadow-xl ${
            isSessionActive 
              ? 'bg-rose-500 text-white shadow-rose-100' 
              : 'bg-white border-2 border-indigo-100 text-indigo-600 shadow-indigo-50'
          }`}
        >
          {isSessionActive ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          {isSessionActive ? t.stopSession : t.startSession}
        </button>
        {!isSessionActive && <p className="text-gray-400 text-sm mt-4">{t.doubleTapToStart}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        {[
          { icon: <Share2 size={20} />, label: t.share },
          { icon: <Mail size={20} />, label: t.contactUs },
          { icon: <MessageSquare size={20} />, label: t.feedback },
          { icon: <Info size={20} />, label: t.aboutUs, onClick: () => setScreen('about') }
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={item.onClick}
            className="p-6 bg-gray-50/50 rounded-3xl flex flex-col items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="text-indigo-500">{item.icon}</div>
            <span className="font-bold text-gray-700">{item.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showDurationPicker && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100] flex items-end"
            onClick={() => setShowDurationPicker(false)}
          >
            <motion.div 
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              className="w-full bg-white rounded-t-[40px] p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
              <h3 className="text-2xl font-bold mb-6">{t.sessionDuration}</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[5, 10, 15, 20, 30, 45, 60].map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      setUserData(prev => ({ ...prev, settings: { ...prev.settings, sessionDuration: d } }));
                      setShowDurationPicker(false);
                    }}
                    className={`w-full p-5 rounded-2xl flex justify-between items-center ${
                      userData.settings.sessionDuration === d ? 'bg-indigo-50 text-indigo-600' : 'text-gray-800'
                    }`}
                  >
                    <span className="text-xl font-bold">{d} min</span>
                    {userData.settings.sessionDuration === d && <ShieldCheck size={20} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderSettings = () => {
    if (!tempSettings) return null;
    const isDirty = JSON.stringify(tempSettings) !== JSON.stringify(userData.settings);

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <button onClick={() => setScreen('home')} className="p-2 text-gray-500"><ChevronLeft size={28} /></button>
          <h2 className="text-2xl font-bold">{t.settings}</h2>
          <button 
            disabled={!isDirty}
            onClick={() => { setUserData(prev => ({ ...prev, settings: tempSettings })); setScreen('home'); }}
            className={`px-6 py-2 rounded-full font-bold ${isDirty ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-300'}`}
          >
            {t.save}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">{t.displayMode}</h3>
            <div className="bg-gray-50 rounded-[32px] p-2 space-y-1">
              {[
                { id: DisplayMode.HALF, label: t.halfScreen },
                { id: DisplayMode.FULL, label: t.fullScreen }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setTempSettings({ ...tempSettings, displayMode: mode.id })}
                  className="w-full p-4 rounded-3xl flex items-center gap-4"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    tempSettings.displayMode === mode.id ? 'border-indigo-500' : 'border-gray-300'
                  }`}>
                    {tempSettings.displayMode === mode.id && <div className="w-3 h-3 bg-indigo-500 rounded-full" />}
                  </div>
                  <span className={`text-lg font-bold ${tempSettings.displayMode === mode.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                    {mode.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">{t.session}</h3>
            <div className="bg-gray-50 rounded-[32px] p-4 space-y-6">
              {[
                { label: t.strictMode, key: 'strictMode' },
                { label: t.audioCue, key: 'audioCue' },
                { label: t.vibration, key: 'vibration' }
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-700">{item.label}</span>
                  <button 
                    onClick={() => setTempSettings({ ...tempSettings, [item.key]: !tempSettings[item.key as keyof Settings] })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${tempSettings[item.key as keyof Settings] ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${tempSettings[item.key as keyof Settings] ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">{t.funPopups}</h3>
            <div className="bg-gray-50 rounded-[32px] p-6 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-700">{t.funPopups}</span>
                <button 
                  onClick={() => setTempSettings({ ...tempSettings, funPopups: !tempSettings.funPopups })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${tempSettings.funPopups ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${tempSettings.funPopups ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              {tempSettings.funPopups && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 font-medium">{t.problemsBeforePopup}</p>
                  <div className="flex gap-3">
                    {[2, 3, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setTempSettings({ ...tempSettings, popupInterval: n })}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                          tempSettings.popupInterval === n ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-indigo-600 border border-indigo-100'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">{t.cardDuration}</h3>
            <button className="w-full bg-gray-50 rounded-[32px] p-6 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-700">{t.answerTime}</span>
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <span>{tempSettings.cardDuration}s</span>
                <ChevronRight size={20} />
              </div>
            </button>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">{t.language}</h3>
            <button className="w-full bg-gray-50 rounded-[32px] p-6 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-700">{t.language}</span>
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <span>{tempSettings.language === Language.EN ? 'English' : tempSettings.language === Language.TE ? 'తెలుగు' : 'हिंदी'}</span>
                <ChevronRight size={20} />
              </div>
            </button>
          </section>
        </div>
      </div>
    );
  };

  const renderPremium = () => (
    <div className="min-h-screen bg-indigo-600 text-white p-8 flex flex-col">
      <div className="flex justify-end">
        <button onClick={() => setScreen('home')} className="p-2 text-white/50 hover:text-white"><X size={32} /></button>
      </div>

      <div className="flex-1 flex flex-col items-center text-center pt-8">
        <div className="w-24 h-24 bg-white/10 rounded-[40px] flex items-center justify-center mb-8">
          <Star size={48} fill="currentColor" className="text-amber-400" />
        </div>
        <h2 className="text-5xl font-bold mb-4">{t.choosePlan}</h2>
        <p className="text-indigo-200 text-lg mb-12">{t.trialIncluded}</p>

        <div className="w-full bg-white/10 rounded-[40px] p-8 mb-8 text-left space-y-4 border border-white/10">
          {[
            { icon: <Lock size={18} />, text: t.strictMode },
            { icon: <ShieldCheck size={18} />, text: t.noAds },
            { icon: <Users size={18} />, text: t.leaderboards },
            { icon: <Mail size={18} />, text: t.prioritySupport }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 text-indigo-100">
              <div className="text-amber-400">{item.icon}</div>
              <span className="font-semibold">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="w-full space-y-4">
          {[
            { id: 'daily', label: t.daily, sub: t.billedWeekly, price: '₹3/day' },
            { id: 'monthly', label: t.monthly, sub: t.billedMonthly, price: '₹73/mo' },
            { id: 'yearly', label: t.yearly, sub: t.billedAnnually, price: '₹703/yr', badge: t.bestValue }
          ].map(plan => (
            <button key={plan.id} className="w-full p-6 bg-white/10 rounded-[32px] border-2 border-transparent hover:border-amber-400 transition-all flex justify-between items-center text-left relative overflow-hidden">
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase">
                  {plan.badge}
                </div>
              )}
              <div>
                <div className="text-xl font-bold">{plan.label}</div>
                <div className="text-indigo-200 text-sm">{plan.sub}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{plan.price}</div>
                <div className="w-6 h-6 rounded-full border-2 border-white/30 mt-2 ml-auto" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <button onClick={() => setShowUPIDialog(true)} className="w-full py-5 bg-amber-400 text-amber-900 rounded-full font-bold text-xl shadow-xl shadow-amber-900/20">
          {t.joinPremium}
        </button>
        <button onClick={() => setShowRestoreDialog(true)} className="w-full text-indigo-200 font-bold underline underline-offset-8">
          {t.restorePurchase}
        </button>
      </div>

      <AnimatePresence>
        {(showRestoreDialog || showUPIDialog) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 text-center text-gray-800 max-w-sm"
            >
              <h3 className="text-2xl font-bold mb-4">
                {showRestoreDialog ? t.restoreTitle : t.upiNotAvailable}
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                {showRestoreDialog ? t.restoreDesc : t.upiDesc}
              </p>
              <button 
                onClick={() => { setShowRestoreDialog(false); setShowUPIDialog(false); }}
                className="w-full py-4 bg-indigo-600 text-white rounded-full font-bold text-lg"
              >
                {t.ok}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderAbout = () => (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-6 flex items-center gap-4">
        <button onClick={() => setScreen('home')} className="p-2 text-gray-500"><ChevronLeft size={28} /></button>
        <h2 className="text-2xl font-bold">{t.aboutUs}</h2>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-indigo-600 rounded-[40px] flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-8">
          QM
        </div>
        <h3 className="text-4xl font-bold mb-2">Quick Math</h3>
        <p className="text-gray-400 font-medium mb-12">{t.version}</p>

        <div className="bg-gray-50 rounded-[40px] p-8 text-left mb-8 border border-gray-100">
          <p className="text-gray-700 text-lg leading-relaxed">{t.aboutDesc}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-indigo-50/50 p-6 rounded-3xl flex flex-col items-center gap-2">
            <WifiOff className="text-indigo-600" size={24} />
            <span className="font-bold text-indigo-900 text-sm">{t.offline}</span>
          </div>
          <div className="bg-indigo-50/50 p-6 rounded-3xl flex flex-col items-center gap-2">
            <Users className="text-indigo-600" size={24} />
            <span className="font-bold text-indigo-900 text-sm">{t.ageLimit}</span>
          </div>
        </div>

        <div className="w-full bg-gray-50 rounded-[40px] p-8 grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">15s</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Per card</div>
          </div>
          <div className="border-x border-gray-200 text-center">
            <div className="text-3xl font-bold text-indigo-600">3</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Levels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">4</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ops</div>
          </div>
        </div>

        <div className="w-full bg-gray-50 rounded-[40px] p-8 text-left mb-12">
          <h4 className="text-xs font-bold text-gray-400 tracking-widest mb-6 uppercase">Operations</h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600"><Plus size={20} /></div>
              <span className="font-bold text-gray-700">Addition</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600"><Minus size={20} /></div>
              <span className="font-bold text-gray-700">Subtraction</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600"><CloseIcon size={20} /></div>
              <span className="font-bold text-gray-700">Multiplication</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600"><Divide size={20} /></div>
              <span className="font-bold text-gray-700">Division</span>
            </div>
          </div>
        </div>

        <button className="w-full py-6 border-2 border-indigo-600 text-indigo-600 rounded-full font-bold text-xl mb-12">
          {t.contactUs}
        </button>

        <p className="text-gray-400 text-sm font-medium">{t.madeWithCare}</p>
      </div>
    </div>
  );

  return (
    <div className="font-sans text-gray-900 select-none">
      <AnimatePresence mode="wait">
        {screen === 'onboarding_lang' && <motion.div key="lang" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderOnboardingLang()}</motion.div>}
        {screen === 'onboarding_privacy' && <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderOnboardingPrivacy()}</motion.div>}
        {screen === 'home' && <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderHome()}</motion.div>}
        {screen === 'settings' && <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderSettings()}</motion.div>}
        {screen === 'premium' && <motion.div key="premium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPremium()}</motion.div>}
        {screen === 'about' && <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderAbout()}</motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {showMathCard && (
          <MathCard 
            settings={userData.settings} 
            onClose={() => setShowMathCard(false)} 
            onAnswer={handleAnswer} 
          />
        )}
        {showFunPopup && (
          <FunPopup 
            type={Math.random() > 0.5 ? 'A' : 'B'} 
            onClose={() => setShowFunPopup(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
