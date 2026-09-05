import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, User } from './src/types';
import MainMenuScreen from './src/screens/MainMenuScreen';
import UnavailableScreen from './src/screens/UnavailableScreen';
import NewVoyageScreen from './src/screens/NewVoyageScreen';
import VoyagesListScreen from './src/screens/VoyagesListScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import ReservationDetailScreen from './src/screens/ReservationDetailScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';
import DocumentDetailScreen from './src/screens/DocumentDetailScreen';
import SelectVoyageForReservationScreen from './src/screens/SelectVoyageForReservationScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SettingsListScreen from './src/screens/SettingsListScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import { LanguageProvider } from './src/i18n';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const ACCENT = '#f4a259';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0d2b2b',
    card: '#123a3a',
    text: '#ffffff',
    border: '#1f4d4d',
    primary: ACCENT,
  },
};

function MenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainMenu" component={MainMenuScreen} />
      <Stack.Screen name="Unavailable" component={UnavailableScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="VoyagesList" component={VoyagesListScreen} options={{ headerShown: true, title: 'Mes voyages' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: true, title: 'Voyage' }} />
      <Stack.Screen name="Reservations" component={ReservationsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} options={{ headerShown: true, title: 'Détail réservation' }} />
      <Stack.Screen name="Documents" component={DocumentsScreen} options={{ headerShown: true }} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ headerShown: true, title: 'Détail document' }} />
      <Stack.Screen name="SelectVoyageForReservation" component={SelectVoyageForReservationScreen} options={{ headerShown: true, title: 'Sélectionner un voyage' }} />
    </Stack.Navigator>
  );
}

function SettingsStack({ token, onLogout }: { token: string; onLogout: () => Promise<void> }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerStyle: { backgroundColor: '#123a3a' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="SettingsList" component={SettingsListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Unavailable" options={{ title: '' }} component={UnavailableScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileDetail" options={{ headerShown: false }}>
        {() => <ProfileScreen token={token} onLogout={onLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AppTabs({ token, userId, onLogout }: { token: string; userId: string; onLogout: () => Promise<void> }) {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: '#8fa3a3',
        tabBarStyle: {
          backgroundColor: '#123a3a',
          borderTopColor: '#1f4d4d',
          height: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Nouveau"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
          ),
        }}
      >
        {() => <NewVoyageScreen userId={userId} />}
      </Tab.Screen>
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Menu', { screen: 'MainMenu' });
          },
        })}
      />
      <Tab.Screen
        name="Paramètres"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      >
        {() => <SettingsStack token={token} onLogout={onLogout} />}
      </Tab.Screen>
          </Tab.Navigator>
        );
      }

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('voya_access_token'),
      AsyncStorage.getItem('voya_user_id'),
    ]).then(([storedToken, storedUserId]) => {
      setToken(storedToken);
      setUserId(storedUserId);
    }).finally(() => setLoading(false));
  }, []);

  const authenticate = async (accessToken: string, user: User) => {
    await AsyncStorage.setItem('voya_access_token', accessToken);
    await AsyncStorage.setItem('voya_user_id', user.id);
    setToken(accessToken);
    setUserId(user.id);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('voya_access_token');
    await AsyncStorage.removeItem('voya_user_id');
    setToken(null);
    setUserId(null);
  };

  if (loading) return null;

  if (!token || !userId) {
    return (
      <SafeAreaProvider>
        <LanguageProvider>
          <NavigationContainer theme={theme}>
            <Stack.Navigator screenOptions={{ headerShown: true, headerStyle: { backgroundColor: '#123a3a' }, headerTintColor: '#fff' }}>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Login" options={{ title: 'Connexion' }}>
                {(props) => <LoginScreen {...props} onAuthenticated={authenticate} />}
              </Stack.Screen>
              <Stack.Screen name="Register" options={{ title: 'Inscription' }}>
                {(props) => <RegisterScreen {...props} onAuthenticated={authenticate} />}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </LanguageProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <NavigationContainer theme={theme}>
          <AppTabs token={token} userId={userId} onLogout={logout} />
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}