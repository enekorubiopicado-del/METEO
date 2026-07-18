import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  Dimensions, Animated, Vibration
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { fetchGardeaData, getHourlyHistory } from '../utils/api';
import { useAlarms } from '../hooks/useAlarms';

const { width } = Dimensions.get('window');

export default function GardeaScreen() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const { checkAlarms } = useAlarms();

  const loadData = useCallback(async () => {
    try {
      const gardeaData = await fetchGardeaData();
      setData(gardeaData);
      setLastUpdate(new Date());
      checkAlarms(gardeaData);

      // Animación de pulso si hay alerta
      if (gardeaData.temperature >= 30) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          ])
        ).start();
        Vibration.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [checkAlarms, pulseAnim]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10 * 60 * 1000); // 10 minutos
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setHistory(getHourlyHistory());
    setRefreshing(false);
  };

  useEffect(() => {
    setHistory(getHourlyHistory());
  }, []);

  const getTempColor = (temp) => {
    if (temp >= 30) return '#ff5a5a';
    if (temp >= 25) return '#ff9a3a';
    if (temp >= 15) return '#4a9eff';
    return '#4ade80';
  };

  const getConditionIcon = (code) => {
    switch (code) {
      case 'sun': return 'sunny';
      case 'cloud': return 'cloudy';
      case 'rain': return 'rainy';
      case 'storm': return 'thunderstorm';
      default: return 'sunny';
    }
  };

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Cargando datos de la estación Gardea...</Text>
      </View>
    );
  }

  const chartData = {
    labels: history.filter((_, i) => i % 4 === 0).map(d => d.hour),
    datasets: [{
      data: history.map(d => d.temperature),
      color: () => '#4a9eff',
      strokeWidth: 2,
    }],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />
      }
    >
      {/* Header de la estación */}
      <View style={styles.stationHeader}>
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>Estación Gardea</Text>
          <Text style={styles.stationLocation}>Laudio/Llodio, Álava</Text>
          <Text style={styles.stationAlt}>127 msnm · Valle del Nervión</Text>
        </View>
        {data.estimated && (
          <View style={styles.estimatedBadge}>
            <Text style={styles.estimatedText}>ESTIMADO</Text>
          </View>
        )}
      </View>

      {/* Tarjeta principal de temperatura */}
      <Animated.View style={[styles.mainCard, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.tempRow}>
          <View style={[styles.weatherIcon, { backgroundColor: getTempColor(data.temperature) + '20' }]}>
            <Ionicons name={getConditionIcon(data.conditionCode || 'sun')} size={40} color={getTempColor(data.temperature)} />
          </View>
          <View style={styles.tempInfo}>
            <Text style={[styles.tempValue, { color: getTempColor(data.temperature) }]}>
              {data.temperature?.toFixed(1)}°
            </Text>
            <Text style={styles.tempLabel}>Temperatura actual</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="thermometer-outline" size={16} color="#6a6a7a" />
            <Text style={styles.detailLabel}>Sensación</Text>
            <Text style={styles.detailValue}>{data.temperature ? (data.temperature + 1.5).toFixed(1) : '--'}°</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Ionicons name="arrow-up-outline" size={16} color="#6a6a7a" />
            <Text style={styles.detailLabel}>Máxima</Text>
            <Text style={styles.detailValue}>{data.maxToday || (data.temperature + 4).toFixed(0)}°</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Ionicons name="arrow-down-outline" size={16} color="#6a6a7a" />
            <Text style={styles.detailLabel}>Mínima</Text>
            <Text style={styles.detailValue}>{data.minToday || (data.temperature - 5).toFixed(0)}°</Text>
          </View>
        </View>
      </Animated.View>

      {/* Métricas */}
      <View style={styles.metricsGrid}>
        <MetricCard
          icon="water-outline"
          label="Humedad"
          value={`${data.humidity || '--'}%`}
          color="#4a9eff"
        />
        <MetricCard
          icon="speedometer-outline"
          label="Presión"
          value={`${data.pressure || '--'} hPa`}
          color="#4ade80"
        />
        <MetricCard
          icon="navigate-outline"
          label="Viento"
          value={`${data.windSpeed || '--'} km/h`}
          subvalue={data.windDirection || ''}
          color="#ff9a3a"
        />
        <MetricCard
          icon="rainy-outline"
          label="Precipitación"
          value={`${data.precipitation || 0} mm`}
          color="#8b5cf6"
        />
      </View>

      {/* Gráfico de temperatura 24h */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Temperatura últimas 24 horas</Text>
        {history.length > 0 && (
          <LineChart
            data={chartData}
            width={width - 48}
            height={180}
            chartConfig={{
              backgroundColor: '#1a1a20',
              backgroundGradientFrom: '#1a1a20',
              backgroundGradientTo: '#1a1a20',
              decimalPlaces: 1,
              color: () => '#4a9eff',
              labelColor: () => '#6a6a7a',
              style: { borderRadius: 12 },
              propsForDots: { r: '3', strokeWidth: '2', stroke: '#4a9eff' },
              propsForBackgroundLines: { stroke: '#2a2a35', strokeDasharray: '' },
            }}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={false}
          />
        )}
      </View>

      {/* Info adicional */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Sobre la estación</Text>
        <Text style={styles.infoText}>
          La estación hidrometeorológica de Gardea se encuentra en el municipio de 
          Laudio/Llodio (Álava), en el valle del río Nervión. Proporciona datos en 
          tiempo real de temperatura, humedad, precipitación, viento y presión atmosférica.
        </Text>
        <Text style={styles.infoSource}>Fuente: Open Data Bizkaia</Text>
      </View>

      {/* Última actualización */}
      <Text style={styles.lastUpdate}>
        Última actualización: {lastUpdate?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) || '--'}
        {data.cached ? ' · (cache)' : ''}
      </Text>
    </ScrollView>
  );
}

function MetricCard({ icon, label, value, subvalue, color }) {
  return (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.metricValue}>{value}</Text>
      {subvalue && <Text style={styles.metricSub}>{subvalue}</Text>}
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f12',
  },
  loading: {
    color: '#a0a0b0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    color: '#f0f0f5',
    fontSize: 20,
    fontWeight: '700',
  },
  stationLocation: {
    color: '#a0a0b0',
    fontSize: 14,
    marginTop: 2,
  },
  stationAlt: {
    color: '#6a6a7a',
    fontSize: 12,
    marginTop: 2,
  },
  estimatedBadge: {
    backgroundColor: '#ff9a3a20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff9a3a40',
  },
  estimatedText: {
    color: '#ff9a3a',
    fontSize: 10,
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  weatherIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempInfo: {
    flex: 1,
  },
  tempValue: {
    fontSize: 56,
    fontWeight: '300',
    letterSpacing: -2,
  },
  tempLabel: {
    color: '#6a6a7a',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a35',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  detailDivider: {
    width: 1,
    backgroundColor: '#2a2a35',
  },
  detailLabel: {
    color: '#6a6a7a',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#f0f0f5',
    fontSize: 16,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  metricCard: {
    width: (width - 40) / 2,
    backgroundColor: '#1a1a20',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a35',
    alignItems: 'center',
    gap: 6,
  },
  metricValue: {
    color: '#f0f0f5',
    fontSize: 20,
    fontWeight: '600',
  },
  metricSub: {
    color: '#6a6a7a',
    fontSize: 12,
  },
  metricLabel: {
    color: '#6a6a7a',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  chartCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 16,
    margin: 16,
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
  infoCard: {
    backgroundColor: '#1a1a20',
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
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
  },
  infoSource: {
    color: '#4a9eff',
    fontSize: 12,
    marginTop: 8,
  },
  lastUpdate: {
    color: '#4a4a5a',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
});