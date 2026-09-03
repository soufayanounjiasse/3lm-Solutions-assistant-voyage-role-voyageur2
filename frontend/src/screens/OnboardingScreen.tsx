import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Language, useLanguage } from '../i18n';

const ACCENT = '#f1a638';
const INK = '#0d4a49';
const BUDGETS = ['€', '€€', '€€€'];
const LANGUAGES: { label: string; value: Language }[] = [{ label: 'Français', value: 'fr' }, { label: 'English', value: 'en' }, { label: 'العربية', value: 'ar' }];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const [tripType, setTripType] = useState('TOURISME');
  const [budget, setBudget] = useState('€€');
  const [interests, setInterests] = useState<string[]>(['Culture', 'Gastronomie']);
  const tripTypes = [{ label: t('tourism'), value: 'TOURISME' }, { label: t('business'), value: 'AFFAIRES' }, { label: t('family'), value: 'FAMILLE' }];
  const interestOptions = [{ label: t('culture'), value: 'Culture' }, { label: t('food'), value: 'Gastronomie' }, { label: t('nature'), value: 'Nature' }, { label: t('shopping'), value: 'Shopping' }];

  const toggleInterest = (interest: string) => {
    setInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <Text style={styles.time}>9:41</Text>
          <Text style={styles.brand}>VOYA <Text style={styles.brandMuted}>· FR</Text> <Ionicons name="airplane-outline" size={12} color={INK} /> <Text style={styles.brandMuted}> TN</Text></Text>
        </View>
        <View style={styles.intro}>
          <View style={styles.logo}><Ionicons name="airplane" size={22} color={INK} /></View>
          <Text style={styles.title}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>
        </View>
        <View style={styles.languageRow}>{LANGUAGES.map((item) => <Pressable key={item.value} onPress={() => setLanguage(item.value)} style={[styles.language, language === item.value && styles.selectedDark]}><Text style={[styles.languageText, language === item.value && styles.selectedDarkText]}>{item.label}</Text></Pressable>)}</View>
        <View style={styles.preferencePanel}>
          <Text style={styles.sectionTitle}>{t('tripType')}</Text>
          <View style={styles.optionRow}>{tripTypes.map((item) => <Pressable key={item.value} onPress={() => setTripType(item.value)} style={[styles.option, tripType === item.value && styles.selectedDark]}><Text style={[styles.optionText, tripType === item.value && styles.selectedDarkText]}>{item.label}</Text></Pressable>)}</View>
          <Text style={styles.sectionTitle}>{t('nightlyBudget')}</Text>
          <View style={styles.optionRow}>{BUDGETS.map((item) => <Pressable key={item} onPress={() => setBudget(item)} style={[styles.option, styles.budgetOption, budget === item && styles.selectedDark]}><Text style={[styles.optionText, budget === item && styles.selectedDarkText]}>{item}</Text></Pressable>)}</View>
          <Text style={styles.sectionTitle}>{t('interests')}</Text>
          <View style={styles.interestRow}>{interestOptions.map((item) => <Pressable key={item.value} onPress={() => toggleInterest(item.value)} style={[styles.option, interests.includes(item.value) && styles.selectedDark]}><Text style={[styles.optionText, interests.includes(item.value) && styles.selectedDarkText]}>{item.label}</Text></Pressable>)}</View>
        </View>
        <Pressable style={styles.continueButton} onPress={() => navigation.navigate('Register')}><Text style={styles.continueText}>{t('continue')}</Text><Ionicons name="arrow-forward" size={18} color="#17130b" /></Pressable>
        <Text style={styles.footnote}>{t('onboardingHint')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f2e9' },
  content: { padding: 18, paddingBottom: 28 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  time: { color: '#597674', fontSize: 11, fontWeight: '600' },
  brand: { color: INK, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  brandMuted: { color: '#78908c', fontWeight: '600' },
  intro: { marginBottom: 18 },
  logo: { width: 40, height: 40, borderRadius: 13, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { color: INK, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#647b78', fontSize: 14, lineHeight: 20, maxWidth: 270 },
  languageRow: { flexDirection: 'row', gap: 7, marginBottom: 14 },
  language: { borderWidth: 1, borderColor: '#d9d0c1', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  languageText: { color: '#687c78', fontSize: 12, fontWeight: '600' },
  selectedDark: { backgroundColor: INK, borderColor: INK },
  selectedDarkText: { color: '#fff', fontWeight: '800' },
  preferencePanel: { backgroundColor: '#fffdfa', borderWidth: 1, borderColor: '#e1d8ca', borderRadius: 14, padding: 12, marginBottom: 14 },
  sectionTitle: { color: '#193b3a', fontSize: 14, fontWeight: '800', marginBottom: 8, marginTop: 2 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  interestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  option: { borderWidth: 1, borderColor: '#ded5c8', borderRadius: 16, paddingHorizontal: 11, paddingVertical: 7 },
  budgetOption: { minWidth: 34, alignItems: 'center' },
  optionText: { color: '#687c78', fontSize: 12, fontWeight: '600' },
  continueButton: { minHeight: 50, backgroundColor: ACCENT, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  continueText: { color: '#17130b', fontSize: 14, fontWeight: '800' },
  footnote: { textAlign: 'center', color: '#8b9993', fontSize: 11, marginTop: 12 },
});
