# 🌦️ MeteoLlodio

Aplicación Android para consultar datos meteorológicos de la **estación Gardea** en Laudio/Llodio (Álava) y predicciones de **AEMET**.

## 📱 Características

### Estación Gardea (Open Data Bizkaia)
- ✅ Temperatura actual en tiempo real
- ✅ Humedad, presión, viento y precipitación
- ✅ Gráfico de temperatura últimas 24 horas
- ✅ Actualización automática cada 10 minutos
- ✅ Badge que indica si los datos son reales o estimados

### Previsión AEMET
- ✅ Predicción 7 días para Llodio (municipio 01036)
- ✅ Temperaturas máximas y mínimas
- ✅ Probabilidad de precipitación
- ✅ Humedad, viento e índice UV
- ✅ Gráfico de temperaturas semanal
- ✅ Detalles expandibles por día

### Alarmas programables
- 🔥 Temperatura alta (ej: avisar cuando llegue a 30°C)
- ❄️ Temperatura baja
- 💧 Humedad alta
- 💨 Viento fuerte
- ✅ Notificaciones push con vibración
- ✅ Botón de prueba para cada alarma

## 🚀 Instalación

### Requisitos
- Node.js 18+
- Cuenta en [Expo](https://expo.dev)
- Cuenta en [EAS](https://expo.dev/build) (gratis)

### Paso 1: Instalar dependencias
```bash
cd meteollodio
npm install
```

### Paso 2: Configurar EAS (para compilar APK)
```bash
npx eas-cli login
npx eas build:configure
```

### Paso 3: Compilar APK
```bash
npx eas build -p android --profile preview
```

Esto generará un archivo `.apk` que puedes instalar directamente en tu Android.

### Alternativa: Ejecutar en desarrollo
```bash
npx expo start
```

Escanea el código QR con la app **Expo Go** en tu móvil.

## 🔑 Configurar API Key de AEMET (opcional pero recomendado)

1. Ve a [opendata.aemet.es/centrodedescargas/altaUsuario](https://opendata.aemet.es/centrodedescargas/altaUsuario)
2. Introduce tu email y solicita la clave
3. Confirma el email
4. Recibirás tu API key
5. En la app, ve a la pestaña **Alarmas** y pega tu API key

Sin API key, la predicción usará datos de demostración.

## 📊 Fuentes de datos

| Fuente | Datos | URL |
|--------|-------|-----|
| Open Data Bizkaia | Estación Gardea (tiempo real) | opendatabizkaia.eus |
| AEMET | Predicción 7 días Llodio | opendata.aemet.es |

## 🏗️ Estructura del proyecto

```
meteollodio/
├── App.js                 # Entry point con navegación
├── app.json               # Configuración Expo
├── package.json           # Dependencias
├── eas.json               # Configuración EAS Build
├── src/
│   ├── screens/
│   │   ├── GardeaScreen.js    # Datos estación Gardea
│   │   ├── AemetScreen.js     # Predicción AEMET
│   │   └── AlarmsScreen.js    # Configuración alarmas
│   ├── hooks/
│   │   └── useAlarms.js       # Gestión de alarmas + notificaciones
│   └── utils/
│       └── api.js             # Llamadas a APIs
└── assets/
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

## 🎨 Diseño

- Modo oscuro optimizado para AMOLED
- Colores intuitivos: 🔵 frío, 🟡 templado, 🔴 caluroso
- Animaciones suaves con Reanimated
- Gráficos interactivos con react-native-chart-kit
- Navegación inferior tipo app nativa

## ⚠️ Notas

- La estación Gardea publica datos en XML vía Open Data Bizkaia. Si el servidor no responde, la app muestra datos estimados basados en el microclima local.
- Las notificaciones de alarmas requieren permisos de notificación en Android.
- La app usa un proxy CORS (`allorigins.win`) para acceder a AEMET desde el móvil.

## 📄 Licencia

MIT - Uso libre para la comunidad de Llodio y alrededores.

---

Hecho con ❤️ para los vecinos de Laudio/Llodio
