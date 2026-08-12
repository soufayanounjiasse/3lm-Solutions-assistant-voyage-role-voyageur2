import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';
import DashboardScreen from './src/screens/DashboardScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import ReservationDetailScreen from './src/screens/ReservationDetailScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';
import DocumentDetailScreen from './src/screens/DocumentDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0d2b2b',
    card: '#123a3a',
    text: '#ffffff',
    border: '#1f4d4d',
    primary: '#f4a259',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Mon voyage' }} />
        <Stack.Screen name="Reservations" component={ReservationsScreen} />
        <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} options={{ title: 'Détail réservation' }} />
        <Stack.Screen name="Documents" component={DocumentsScreen} />
        <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: 'Détail document' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}