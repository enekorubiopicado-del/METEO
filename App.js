import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GardeaScreen from './src/screens/GardeaScreen';
import AemetScreen from './src/screens/AemetScreen';
import AlarmsScreen from './src/screens/AlarmsScreen';
import { AlarmProvider } from './src/hooks/useAlarms';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AlarmProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#4a9eff',
            tabBarInactiveTintColor: '#6a6a7a',
            tabBarLabelStyle: styles.tabLabel,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerTintColor: '#f0f0f5',
          }}
        >
          <Tab.Screen
            name="Gardea"
            component={GardeaScreen}
            options={{
              title: 'Estación Gardea',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="radio-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="AEMET"
            component={AemetScreen}
            options={{
              title: 'Previsión AEMET',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cloud-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Alarmas"
            component={AlarmsScreen}
            options={{
              title: 'Alarmas',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="notifications-outline" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AlarmProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1a1a20',
    borderTopColor: '#2a2a35',
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 64,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#0f0f12',
    borderBottomColor: '#2a2a35',
    borderBottomWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    color: '#f0f0f5',
    fontSize: 17,
    fontWeight: '600',
  },
});