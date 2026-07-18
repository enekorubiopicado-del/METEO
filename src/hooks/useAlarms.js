import React, { createContext, useState, useEffect } from "react";

export const AlarmContext = createContext();

export function AlarmProvider({ children }) {
  const [alarms, setAlarms] = useState([
    { id: 1, label: "Temperatura > 30°C", enabled: false, threshold: 30 },
    { id: 2, label: "Temperatura < 0°C", enabled: false, threshold: 0 },
    { id: 3, label: "Viento > 60 km/h", enabled: false, threshold: 60 },
  ]);

  const [lastData, setLastData] = useState(null);

  const updateData = (data) => {
    setLastData(data);
  };

  useEffect(() => {
    if (!lastData) return;
    alarms.forEach((alarm) => {
      if (!alarm.enabled) return;
      if (alarm.id === 1 && lastData.temperature > alarm.threshold) {
        alert("Alarma: temperatura superior a 30°C");
      }
      if (alarm.id === 2 && lastData.temperature < alarm.threshold) {
        alert("Alarma: temperatura bajo cero");
      }
      if (alarm.id === 3 && lastData.wind > alarm.threshold) {
        alert("Alarma: viento fuerte");
      }
    });
  }, [lastData, alarms]);

  const toggleAlarm = (id) => {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, enabled: !a.enabled } : a
      )
    );
  };

  return (
    <AlarmContext.Provider value={{ alarms, toggleAlarm, updateData }}>
      {children}
    </AlarmContext.Provider>
  );
}
