// settings.js

const settings = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || "",
  authDomain: process.env.REACT_APP_AUTH_DOMAIN || "",
  authClientId: process.env.REACT_APP_AUTH_CLIENT_ID || "",
  authAudience: process.env.REACT_APP_AUTH_AUDIENCE || "",
  reachHabitBaseValue: 5
};

export default settings;