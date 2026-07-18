import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const AlarmContext = createContext();

export function AlarmProvider({ children }) {
  const [alarms, setAlarms] = useState({
    tempMax: { enabled: true, value: 30 },
    tempMin: { enabled: false, value: 5 },
    humidityMax: { enabled: false, value: 85 },
    windMax: { enabled: false, value: 50 },
  });
  const [lastAlert, setLastAlert] = useState({});

  useEffect(() => {
    loadAlarms();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  };

  const loadAlarms = async () => {
    try {
      const saved = await AsyncStorage.getItem('meteollodio_alarms');
      if (saved) setAlarms(JSON.parse(saved));
    } catch (e) {}
  };

  const saveAlarms = async (newAlarms) => {
    setAlarms(newAlarms);
    await AsyncStorage.setItem('meteollodio_alarms', JSON.stringify(newAlarms));
  };

  const updateAlarm = (key, updates) => {
    const newAlarms = { ...alarms, [key]: { ...alarms[key], ...updates } };
    saveAlarms(newAlarms);
  };

  const checkAlarms = useCallback((data) => {
    if (!data) return;
    const now = Date.now();
    const alerts = [];

    if (alarms.tempMax.enabled && data.temperature >= alarms.tempMax.value) {
      const key = `tempMax_${Math.floor(now / 600000)}`; // Una alerta cada 10 min
      if (!lastAlert[key]) {
        alerts.push({
          title: '🔥 Alerta de temperatura alta',
          body: `La estación Gardea marca ${data.temperature.toFixed(1)}°C (umbral: ${alarms.tempMax.value}°C)`,
          key,
        });
      }
    }

    if (alarms.tempMin.enabled && data.temperature <= alarms.tempMin.value) {
      const key = `tempMin_${Math.floor(now / 600000)}`;
      if (!lastAlert[key]) {
        alerts.push({
          title: '❄️ Alerta de temperatura baja',
          body: `La estación Gardea marca ${data.temperature.toFixed(1)}°C (umbral: ${alarms.tempMin.value}°C)`,
          key,
        });
      }
    }

    if (alarms.humidityMax.enabled && data.humidity >= alarms.humidityMax.value) {
      const key = `humidity_${Math.floor(now / 600000)}`;
      if (!lastAlert[key]) {
        alerts.push({
          title: '💧 Alerta de humedad alta',
          body: `Humedad del ${data.humidity}% en Gardea (umbral: ${alarms.humidityMax.value}%)`,
          key,
        });
      }
    }

    if (alarms.windMax.enabled && data.windSpeed >= alarms.windMax.value) {
      const key = `wind_${Math.floor(now / 600000)}`;
      if (!lastAlert[key]) {
        alerts.push({
          title: '💨 Alerta de viento fuerte',
          body: `Viento de ${data.windSpeed} km/h en Gardea (umbral: ${alarms.windMax.value} km/h)`,
          key,
        });
      }
    }

    alerts.forEach(alert => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: alert.title,
          body: alert.body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
      setLastAlert(prev => ({ ...prev, [alert.key]: now }));
    });
  }, [alarms, lastAlert]);

  return (
    <AlarmContext.Provider value={{ alarms, updateAlarm, checkAlarms }}>
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarms() {
  return useContext(AlarmContext);
}