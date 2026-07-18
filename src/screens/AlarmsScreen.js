import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlarms } from '../hooks/useAlarms';

export default function AlarmsScreen() {
  const { alarms, updateAlarm } = useAlarms();
  const [aemetKey, setAemetKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const saveApiKey = async () => {
    if (aemetKey.trim()) {
      await AsyncStorage.setItem('aemet_api_key', aemetKey.trim());
      Alert.alert('✅ Guardado', 'API key de AEMET guardada correctamente');
      setAemetKey('');
    }
  };

  const testAlarm = (type) => {
    const messages = {
      tempMax: '🔥 Simulación: Temperatura de 32°C en Gardea',
      tempMin: '❄️ Simulación: Temperatura de 2°C en Gardea',
      humidityMax: '💧 Simulación: Humedad del 90% en Gardea',
      windMax: '💨 Simulación: Viento de 60 km/h en Gardea',
    };
    Alert.alert('🧪 Prueba de alarma', messages[type]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Alarmas</Text>
        <Text style={styles.subtitle}>Configura alertas para la estación Gardea</Text>
      </View>

      {/* Alarma temperatura máxima */}
      <AlarmCard
        icon="flame-outline"
        iconColor="#ff5a5a"
        title="Temperatura alta"
        description="Alerta cuando la temperatura supere el umbral"
        alarm={alarms.tempMax}
        onToggle={(enabled) => updateAlarm('tempMax', { enabled })}
        onChangeValue={(value) => updateAlarm('tempMax', { value: parseFloat(value) || 30 })}
        unit="°C"
        min={20}
        max={45}
        step={0.5}
        onTest={() => testAlarm('tempMax')}
      />

      {/* Alarma temperatura mínima */}
      <AlarmCard
        icon="snow-outline"
        iconColor="#4a9eff"
        title="Temperatura baja"
        description="Alerta cuando la temperatura baje del umbral"
        alarm={alarms.tempMin}
        onToggle={(enabled) => updateAlarm('tempMin', { enabled })}
        onChangeValue={(value) => updateAlarm('tempMin', { value: parseFloat(value) || 5 })}
        unit="°C"
        min={-10}
        max={15}
        step={0.5}
        onTest={() => testAlarm('tempMin')}
      />

      {/* Alarma humedad */}
      <AlarmCard
        icon="water-outline"
        iconColor="#4a9eff"
        title="Humedad alta"
        description="Alerta cuando la humedad supere el umbral"
        alarm={alarms.humidityMax}
        onToggle={(enabled) => updateAlarm('humidityMax', { enabled })}
        onChangeValue={(value) => updateAlarm('humidityMax', { value: parseFloat(value) || 85 })}
        unit="%"
        min={50}
        max={100}
        step={5}
        onTest={() => testAlarm('humidityMax')}
      />

      {/* Alarma viento */}
      <AlarmCard
        icon="navigate-outline"
        iconColor="#ff9a3a"
        title="Viento fuerte"
        description="Alerta cuando el viento supere el umbral"
        alarm={alarms.windMax}
        onToggle={(enabled) => updateAlarm('windMax', { enabled })}
        onChangeValue={(value) => updateAlarm('windMax', { value: parseFloat(value) || 50 })}
        unit="km/h"
        min={20}
        max={120}
        step={5}
        onTest={() => testAlarm('windMax')}
      />

      {/* Configuración AEMET */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="key-outline" size={20} color="#4a9eff" />
          <Text style={styles.sectionTitle}>API Key AEMET</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Introduce tu API key de AEMET OpenData para obtener predicciones reales.
          Solicítala gratis en opendata.aemet.es
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Pega tu API key aquí..."
            placeholderTextColor="#4a4a5a"
            value={aemetKey}
            onChangeText={setAemetKey}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
            <Ionicons name={showApiKey ? "eye-off-outline" : "eye-outline"} size={20} color="#6a6a7a" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={saveApiKey}>
          <Text style={styles.saveButtonText}>Guardar API Key</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>¿Cómo funcionan las alarmas?</Text>
        <Text style={styles.infoText}>
          Las alarmas se comprueban automáticamente cada vez que se actualizan los datos 
          de la estación Gardea (cada 10 minutos). Si se activa una alarma, recibirás una 
          notificación push en tu móvil con vibración.
        </Text>
        <Text style={styles.infoText}>
          Para evitar spam, cada alarma solo se dispara una vez cada 10 minutos como máximo.
        </Text>
      </View>
    </ScrollView>
  );
}

function AlarmCard({ icon, iconColor, title, description, alarm, onToggle, onChangeValue, unit, min, max, step, onTest }) {
  const [value, setValue] = useState(String(alarm.value));

  const handleChange = (text) => {
    setValue(text);
    onChangeValue(text);
  };

  const increment = () => {
    const newVal = Math.min(max, parseFloat(value || 0) + step);
    const rounded = Math.round(newVal * 10) / 10;
    setValue(String(rounded));
    onChangeValue(rounded);
  };

  const decrement = () => {
    const newVal = Math.max(min, parseFloat(value || 0) - step);
    const rounded = Math.round(newVal * 10) / 10;
    setValue(String(rounded));
    onChangeValue(rounded);
  };

  return (
    <View style={[styles.alarmCard, alarm.enabled && styles.alarmCardActive]}>
      <View style={styles.alarmHeader}>
        <View style={styles.alarmIcon}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.alarmInfo}>
          <Text style={styles.alarmTitle}>{title}</Text>
          <Text style={styles.alarmDesc}>{description}</Text>
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#2a2a35', true: iconColor + '50' }}
          thumbColor={alarm.enabled ? iconColor : '#6a6a7a'}
        />
      </View>

      {alarm.enabled && (
        <View style={styles.alarmControls}>
          <Text style={styles.thresholdLabel}>Umbral:</Text>
          <View style={styles.valueRow}>
            <TouchableOpacity style={styles.stepButton} onPress={decrement}>
              <Ionicons name="remove" size={18} color="#f0f0f5" />
            </TouchableOpacity>
            <TextInput
              style={styles.valueInput}
              value={value}
              onChangeText={handleChange}
              keyboardType="decimal-pad"
              textAlign="center"
              selectTextOnFocus
            />
            <Text style={styles.unit}>{unit}</Text>
            <TouchableOpacity style={styles.stepButton} onPress={increment}>
              <Ionicons name="add" size={18} color="#f0f0f5" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.testButton} onPress={onTest}>
            <Ionicons name="notifications-outline" size={14} color="#6a6a7a" />
            <Text style={styles.testButtonText}>Probar alarma</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f12',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    color: '#f0f0f5',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6a6a7a',
    fontSize: 14,
    marginTop: 4,
  },
  alarmCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  alarmCardActive: {
    borderColor: '#4a9eff30',
  },
  alarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alarmIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#22222a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTitle: {
    color: '#f0f0f5',
    fontSize: 15,
    fontWeight: '600',
  },
  alarmDesc: {
    color: '#6a6a7a',
    fontSize: 12,
    marginTop: 2,
  },
  alarmControls: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a35',
  },
  thresholdLabel: {
    color: '#a0a0b0',
    fontSize: 13,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2a2a35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueInput: {
    backgroundColor: '#0f0f12',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f0f0f5',
    fontSize: 18,
    fontWeight: '600',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  unit: {
    color: '#6a6a7a',
    fontSize: 16,
    fontWeight: '500',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  testButtonText: {
    color: '#6a6a7a',
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#f0f0f5',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionDesc: {
    color: '#6a6a7a',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f0f12',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  input: {
    flex: 1,
    color: '#f0f0f5',
    fontSize: 14,
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: '#4a9eff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 30,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  infoTitle: {
    color: '#f0f0f5',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#a0a0b0',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
});