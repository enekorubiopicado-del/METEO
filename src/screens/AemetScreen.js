import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAemetForecast } from '../utils/api';

const { width } = Dimensions.get('window');

export default function AemetScreen() {
  const [forecast, setForecast] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const loadForecast = useCallback(async () => {
    const key = await AsyncStorage.getItem('aemet_api_key');
    setApiKey(key || '');
    const data = await fetchAemetForecast(key);
    setForecast(data);
  }, []);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadForecast();
    setRefreshing(false);
  };

  const getWeatherIcon = (code) => {
    switch (code) {
      case 'sun': return { icon: 'sunny', color: '#ff9a3a' };
      case 'cloud': return { icon: 'cloudy', color: '#a0a0b0' };
      case 'rain': return { icon: 'rainy', color: '#4a9eff' };
      case 'storm': return { icon: 'thunderstorm', color: '#8b5cf6' };
      default: return { icon: 'sunny', color: '#ff9a3a' };
    }
  };

  const chartData = forecast.length > 0 ? {
    labels: forecast.map(d => d.day.split(' ')[0]),
    datasets: [
      {
        data: forecast.map(d => d.max),
        color: () => '#ff5a5a',
        strokeWidth: 2,
      },
      {
        data: forecast.map(d => d.min),
        color: () => '#4a9eff',
        strokeWidth: 2,
      },
    ],
    legend: ['Máxima', 'Mínima'],
  } : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Previsión AEMET</Text>
        <Text style={styles.subtitle}>Laudio/Llodio (01036) · Álava</Text>
        {!apiKey && (
          <View style={styles.apiKeyBanner}>
            <Ionicons name="key-outline" size={16} color="#ff9a3a" />
            <Text style={styles.apiKeyText}>
              Configura tu API key de AEMET para datos reales
            </Text>
          </View>
        )}
      </View>

      {/* Gráfico de temperaturas */}
      {chartData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Temperaturas 7 días</Text>
          <LineChart
            data={chartData}
            width={width - 48}
            height={200}
            chartConfig={{
              backgroundColor: '#1a1a20',
              backgroundGradientFrom: '#1a1a20',
              backgroundGradientTo: '#1a1a20',
              decimalPlaces: 0,
              color: () => '#f0f0f5',
              labelColor: () => '#6a6a7a',
              style: { borderRadius: 12 },
              propsForDots: { r: '4', strokeWidth: '2' },
              propsForBackgroundLines: { stroke: '#2a2a35', strokeDasharray: '' },
            }}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
          />
        </View>
      )}

      {/* Lista de días */}
      <View style={styles.forecastList}>
        <Text style={styles.sectionTitle}>Próximos 7 días</Text>
        {forecast.map((day, index) => {
          const weather = getWeatherIcon(day.code);
          const isSelected = selectedDay === index;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayCard, isSelected && styles.dayCardSelected]}
              onPress={() => setSelectedDay(isSelected ? null : index)}
              activeOpacity={0.8}
            >
              <View style={styles.dayRow}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayName}>{day.day}</Text>
                  <View style={styles.weatherInfo}>
                    <Ionicons name={weather.icon} size={18} color={weather.color} />
                    <Text style={[styles.dayDesc, { color: weather.color }]}>{day.desc}</Text>
                  </View>
                </View>

                <View style={styles.temps}>
                  <Text style={styles.tempMax}>{day.max}°</Text>
                  <Text style={styles.tempMin}>{day.min}°</Text>
                </View>

                <Ionicons
                  name={isSelected ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#6a6a7a"
                />
              </View>

              {/* Detalles expandibles */}
              {isSelected && (
                <View style={styles.dayDetails}>
                  <DetailRow icon="water-outline" label="Humedad" value={`${day.humidityMin}-${day.humidityMax}%`} />
                  <DetailRow icon="rainy-outline" label="Prob. lluvia" value={`${day.probPrecip}%`} />
                  <DetailRow icon="navigate-outline" label="Viento" value={`${day.windSpeed} km/h ${day.windDir}`} />
                  {day.uvIndex > 0 && (
                    <DetailRow icon="sunny-outline" label="UV Máx" value={String(day.uvIndex)} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Info AEMET */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Sobre AEMET</Text>
        <Text style={styles.infoText}>
          Datos proporcionados por la Agencia Estatal de Meteorología (AEMET). 
          La predicción se actualiza varias veces al día. Para datos en tiempo real 
          de la estación Gardea, consulta la pestaña "Estación Gardea".
        </Text>
      </View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color="#6a6a7a" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
    marginTop: 2,
  },
  apiKeyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ff9a3a15',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ff9a3a30',
  },
  apiKeyText: {
    color: '#ff9a3a',
    fontSize: 13,
    flex: 1,
  },
  chartCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  chartTitle: {
    color: '#f0f0f5',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -8,
  },
  forecastList: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#f0f0f5',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  dayCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  dayCardSelected: {
    borderColor: '#4a9eff50',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    color: '#f0f0f5',
    fontSize: 15,
    fontWeight: '600',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dayDesc: {
    fontSize: 13,
  },
  temps: {
    flexDirection: 'row',
    gap: 12,
    marginRight: 8,
  },
  tempMax: {
    color: '#ff5a5a',
    fontSize: 18,
    fontWeight: '600',
  },
  tempMin: {
    color: '#4a9eff',
    fontSize: 18,
    fontWeight: '600',
  },
  dayDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a35',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    color: '#6a6a7a',
    fontSize: 13,
    flex: 1,
  },
  detailValue: {
    color: '#f0f0f5',
    fontSize: 13,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a35',
    marginBottom: 30,
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
  },
});