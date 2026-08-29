import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './src/types';
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

// Composant séparé pour pouvoir utiliser useSafeAreaInsets
// (doit être DANS le SafeAreaProvider, donc pas directement dans App).
function AppTabs() {
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
        component={NewVoyageScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
          ),
        }}
      />
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
        // Quel que soit l'écran affiché dans la pile Menu, on revient toujours à la racine.
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
        {() => <UnavailableScreen route={{ params: { title: 'Paramètres' } } as any} navigation={{} as any} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <AppTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}