import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'geofanceApplication',
  webDir: 'www',
  plugins: {
    "Geolocation": {
      "requestAccuracy": "high"
    }
  }
};

export default config;
