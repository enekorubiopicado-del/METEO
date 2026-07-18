import React, { useContext } from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { AlarmContext } from "../hooks/useAlarms";

export default function AlarmsScreen() {
  const { alarms, toggleAlarm } = useContext(AlarmContext);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Alarmas</Text>

      {alarms.map((alarm) => (
        <View key={alarm.id} style={styles.card}>
          <Text style={styles.label}>{alarm.label}</Text>
          <Switch
            value={alarm.enabled}
            onValueChange={() => toggleAlarm(alarm.id)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f12",
    padding: 16,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "#f0f0f5",
    fontSize: 18,
  },
});
