import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import GardeaScreen from "./src/screens/GardeaScreen";
import AemetScreen from "./src/screens/AemetScreen";
import AlarmsScreen from "./src/screens/AlarmsScreen";
import { AlarmProvider } from "./src/hooks/useAlarms";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AlarmProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: "#101a10",
              borderTopColor: "#2a2a35",
              borderTopWidth: 1,
              paddingBottom: 8,
              height: 64,
            },
            tabBarActiveTintColor: "#A4E9ff",
            tabBarInactiveTintColor: "#6A6a7a",
            tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
            headerStyle: {
              backgroundColor: "#0f0f12",
              borderBottomColor: "#2a2a35",
              borderBottomWidth: 1,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleStyle: {
              color: "#f0f0f5",
              fontSize: 17,
              fontWeight: "600",
            },
            headerTintColor: "#f0f0f5",
          }}
        >
          <Tab.Screen
            name="Gardea"
            component={GardeaScreen}
            options={{
              title: "Estación Gardea",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="radio-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="AEMET"
            component={AemetScreen}
            options={{
              title: "Previsión AEMET",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cloud-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Alarmas"
            component={AlarmsScreen}
            options={{
              title: "Alarmas",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="notifications-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AlarmProvider>
  );
}
