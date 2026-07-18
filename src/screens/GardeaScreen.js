import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { AlarmContext } from "../hooks/useAlarms";

export default function GardeaScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { updateData } = useContext(AlarmContext);

  // URL de la estación (ajústala si tienes otra oficial)
  const GARDEA_URL = "https://laudiokoestazioa.eus/api/data";

  const fetchData = async () => {
    try {
      const response = await fetch(GARDEA_URL);
      const json = await response.json();
      setData(json);
      updateData(json);
    } catch (error) {
      console.log("Error cargando datos de Gardea:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A4E9ff" />
        <Text style={styles.loadingText}>Cargando datos de Gardea…</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudieron cargar los datos.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Estación Gardea (Euskalmet)</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Temperatura</Text>
        <Text style={styles.value}>{data.temperature} °C</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Humedad</Text>
        <Text style={styles.value}>{data.humidity} %</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Viento</Text>
        <Text style={styles.value}>{data.wind} km/h</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Lluvia</Text>
        <Text style={styles.value}>{data.rain} mm</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Presión</Text>
        <Text style={styles.value}>{data.pressure} hPa</Text>
      </View>

      <Text style={styles.update}>Actualizado: {data.updated}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f12",
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: "#0f0f12",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#f0f0f5",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
  },
  title: {
    color: "#A4E9ff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1a1a1f",
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    borderColor: "#2a2a35",
    borderWidth: 1,
  },
  label: {
    color: "#6A6a7a",
    fontSize: 14,
  },
  value: {
    color: "#f0f0f5",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 4,
  },
  update: {
    color: "#6A6a7a",
    fontSize: 12,
    marginTop: 20,
    textAlign: "center",
  },
});
