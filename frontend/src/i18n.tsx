import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nManager } from 'react-native';

export type Language = 'fr' | 'en' | 'ar';

const translations = {
  fr: {
    welcome: 'Bienvenue sur Voya',
    welcomeSubtitle: 'Votre compagnon de voyage, du départ au retour.',
    continue: 'Continuer',
    onboardingHint: 'Ces préférences pourront être modifiées dans ton profil.',
    tripType: 'Type de voyage',
    tourism: 'Tourisme',
    business: 'Affaires',
    family: 'Famille',
    student: 'Étudiant',
    nightlyBudget: 'Budget par nuit',
    budgetMin: 'Budget minimum',
    budgetMax: 'Budget maximum',
    interestsPlaceholder: "Centres d'intérêt, séparés par des virgules",
    interests: "Centres d'intérêt",
    culture: 'Culture',
    food: 'Gastronomie',
    nature: 'Nature',
    shopping: 'Shopping',
    login: 'Connexion',
    register: 'Inscription',
    createAccount: 'Créer ton compte',
    alreadyAccount: "J'ai déjà un compte",
    signIn: 'Se connecter',
    emailOrPhone: 'Email ou téléphone',
    password: 'Mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    createAccountButton: 'Créer le compte',
    profile: 'Mon profil',
    personalInfo: 'Informations personnelles',
    preferences: 'Préférences de voyage',
    save: 'Enregistrer',
    logout: 'Se déconnecter',
    missingFields: 'Champs manquants',
    missingLogin: 'Saisis ton email ou téléphone et ton mot de passe.',
    missingRegister: 'Remplis ton nom, prénom, mot de passe et email ou téléphone.',
    connectionError: 'Connexion impossible',
    registrationError: 'Inscription impossible',
    genericError: 'Une erreur est survenue.',
    noProfile: 'Impossible de charger le profil.',
    saved: 'Profil enregistré',
    savedMessage: 'Tes informations ont été mises à jour.',
    menu: 'Menu',
    reservations: 'Réservations',
    myTrips: 'Mes voyages',
    assistant: 'Assistant IA',
    esim: 'eSIM',
    driver: 'Chauffeur',
    hotels: 'Hôtels',
    marketplace: 'Marketplace',
    wallet: 'Travel Wallet',
    payment: 'Paiement',
    simpleMode: 'Mode simple',
    soon: 'Bientôt',
    newTrip: 'Nouveau voyage',
    destination: 'Destination',
    chooseDestination: 'Choisir une destination',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    chooseDate: 'Choisir une date',
    createTrip: 'Créer le voyage',
    select: 'Sélectionner...',
  },
  en: {
    welcome: 'Welcome to Voya',
    welcomeSubtitle: 'Your travel companion, from departure to return.',
    continue: 'Continue',
    onboardingHint: 'These preferences can be changed in your profile.',
    tripType: 'Trip type',
    tourism: 'Tourism',
    business: 'Business',
    family: 'Family',
    student: 'Student',
    nightlyBudget: 'Budget per night',
    budgetMin: 'Minimum budget',
    budgetMax: 'Maximum budget',
    interestsPlaceholder: 'Interests, separated by commas',
    interests: 'Interests',
    culture: 'Culture',
    food: 'Food',
    nature: 'Nature',
    shopping: 'Shopping',
    login: 'Sign in',
    register: 'Sign up',
    createAccount: 'Create your account',
    alreadyAccount: 'I already have an account',
    signIn: 'Sign in',
    emailOrPhone: 'Email or phone',
    password: 'Password',
    firstName: 'First name',
    lastName: 'Last name',
    createAccountButton: 'Create account',
    profile: 'My profile',
    personalInfo: 'Personal information',
    preferences: 'Travel preferences',
    save: 'Save',
    logout: 'Sign out',
    missingFields: 'Missing fields',
    missingLogin: 'Enter your email or phone and password.',
    missingRegister: 'Enter your first name, last name, password and email or phone.',
    connectionError: 'Unable to sign in',
    registrationError: 'Unable to sign up',
    genericError: 'Something went wrong.',
    noProfile: 'Unable to load your profile.',
    saved: 'Profile saved',
    savedMessage: 'Your information has been updated.',
    menu: 'Menu', reservations: 'Bookings', myTrips: 'My trips', assistant: 'AI assistant', esim: 'eSIM', driver: 'Driver', hotels: 'Hotels', marketplace: 'Marketplace', wallet: 'Travel Wallet', payment: 'Payment', simpleMode: 'Simple mode', soon: 'Soon', newTrip: 'New trip', destination: 'Destination', chooseDestination: 'Choose a destination', startDate: 'Start date', endDate: 'End date', chooseDate: 'Choose a date', createTrip: 'Create trip',
    select: 'Select...',
  },
  ar: {
    welcome: 'مرحبًا بك في Voya',
    welcomeSubtitle: 'رفيق سفرك، من المغادرة إلى العودة.',
    continue: 'متابعة',
    onboardingHint: 'يمكن تعديل هذه التفضيلات من ملفك الشخصي.',
    tripType: 'نوع الرحلة',
    tourism: 'سياحة',
    business: 'أعمال',
    family: 'عائلية',
    student: 'طالب',
    nightlyBudget: 'الميزانية لكل ليلة',
    budgetMin: 'الحد الأدنى للميزانية',
    budgetMax: 'الحد الأقصى للميزانية',
    interestsPlaceholder: 'الاهتمامات، مفصولة بفواصل',
    interests: 'الاهتمامات',
    culture: 'ثقافة',
    food: 'فن الطهي',
    nature: 'طبيعة',
    shopping: 'تسوق',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    createAccount: 'أنشئ حسابك',
    alreadyAccount: 'لدي حساب بالفعل',
    signIn: 'تسجيل الدخول',
    emailOrPhone: 'البريد الإلكتروني أو الهاتف',
    password: 'كلمة المرور',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    createAccountButton: 'إنشاء الحساب',
    profile: 'ملفي الشخصي',
    personalInfo: 'المعلومات الشخصية',
    preferences: 'تفضيلات السفر',
    save: 'حفظ',
    logout: 'تسجيل الخروج',
    missingFields: 'حقول ناقصة',
    missingLogin: 'أدخل بريدك الإلكتروني أو هاتفك وكلمة المرور.',
    missingRegister: 'أدخل الاسم الأول واسم العائلة وكلمة المرور والبريد أو الهاتف.',
    connectionError: 'تعذر تسجيل الدخول',
    registrationError: 'تعذر إنشاء الحساب',
    genericError: 'حدث خطأ ما.',
    noProfile: 'تعذر تحميل الملف الشخصي.',
    saved: 'تم حفظ الملف الشخصي',
    savedMessage: 'تم تحديث معلوماتك.',
    menu: 'القائمة', reservations: 'الحجوزات', myTrips: 'رحلاتي', assistant: 'المساعد الذكي', esim: 'شريحة eSIM', driver: 'سائق', hotels: 'فنادق', marketplace: 'السوق', wallet: 'محفظة السفر', payment: 'الدفع', simpleMode: 'الوضع البسيط', soon: 'قريبًا', newTrip: 'رحلة جديدة', destination: 'الوجهة', chooseDestination: 'اختر وجهة', startDate: 'تاريخ البداية', endDate: 'تاريخ النهاية', chooseDate: 'اختر تاريخًا', createTrip: 'إنشاء الرحلة',
    select: 'اختيار...',
  },
} as const;

type TranslationKey = keyof typeof translations.fr;
type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'voya_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'fr' || stored === 'en' || stored === 'ar') setLanguageState(stored);
    });
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    void AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
    I18nManager.allowRTL(nextLanguage === 'ar');
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: TranslationKey) => translations[language][key],
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
