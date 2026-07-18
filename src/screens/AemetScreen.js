import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";

export default function AemetScreen() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlbmVrb3J1QGhvdG1haWwuY29tIiwianRpIjoiMTFkMzFjOTctMmMzZC00YmEwLWE0ZmUtNmI4YTRmOWZlZjU3IiwiZXhwIjoxNzkzMDIyMjkzLCJpc3MiOiJBRU1FVCIsImlhdCI6MTc4NDM4MjI5MywidXNlcklkIjoiMTFkMzFjOTctMmMzZC00YmEwLWE0ZmUtNmI4YTRmOWZlZjU3Iiwicm9sZSI6IiJ9.8DLWG1n-erB40cROwUa2v-ISedx38bAqMUhdZnlvkhw";
  const AEMET_URL =
    "https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/01032/?api_key=" +
    API_KEY;

  const fetchForecast = async () => {
    try {
      const response = await fetch(AEMET_URL);
      const json = await response.json();
      const dataUrl = json.datos;
      const finalResponse = await fetch(dataUrl);
      const finalJson = await finalResponse.json();
      setForecast(finalJson[0]);
    } catch (error) {
      console.log("Error cargando AEMET:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A4E9ff" />
        <Text style={styles.loadingText}>Cargando previsión…</Text>
      </View>
    );
  }

  if (!forecast) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo cargar la previsión.</Text>
      </View>
    );
  }

  const today = forecast.prediccion.dia[0];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Previsión AEMET (Laudio)</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Temperatura máxima</Text>
        <Text style={styles.value}>{today.temperatura.maxima} °C</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Temperatura mínima</Text>
        <Text style={styles.value}>{today.temperatura.minima} °C</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Estado del cielo</Text>
        <Text style={styles.value}>
          {today.estadoCielo[0]?.descripcion || "—"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Probabilidad de lluvia</Text>
        <Text style={styles.value}>
          {today.probPrecipitacion[0]?.value || 0} %
        </Text>
      </View>
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
});
