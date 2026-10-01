const expoConfig = require('./app.json').expo;
const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

module.exports = {
  ...expoConfig,
  ...(mapsApiKey ? {
    android: {
      ...expoConfig.android,
      config: { ...expoConfig.android?.config, googleMaps: { apiKey: mapsApiKey } },
    },
    ios: {
      ...expoConfig.ios,
      config: { ...expoConfig.ios?.config, googleMapsApiKey: mapsApiKey },
    },
  } : {}),
};