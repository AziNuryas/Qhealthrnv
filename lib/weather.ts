// lib/weather.ts
import * as Location from 'expo-location';
import Constants from 'expo-constants';

export type WeatherData = {
  temp: number;
  condition: string;
  icon: string;
  location: string;
};

export const fetchCurrentWeather = async (): Promise<WeatherData | null> => {
  try {
    const API_KEY = Constants?.expoConfig?.extra?.weatherApiKey;
    
    if (!API_KEY || API_KEY.includes('ganti_dengan')) {
      console.warn('⚠️ WEATHER_API_KEY belum diatur. Gunakan fallback.');
      return {
        temp: 28,
        condition: 'Cerah',
        icon: '01d',
        location: 'Jakarta',
      };
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    let location;

    if (status !== 'granted') {
      location = { coords: { latitude: -6.2088, longitude: 106.8456 } };
    } else {
      location = await Location.getCurrentPositionAsync({});
    }

    const { latitude, longitude } = location.coords;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=id`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal ambil cuaca');
    }

    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      location: data.name || 'Lokasimu',
    };
  } catch (error) {
    console.error('Cuaca error:', error);
    return {
      temp: 26,
      condition: 'Berawan',
      icon: '02d',
      location: 'Lokasi Tidak Diketahui',
    };
  }
};