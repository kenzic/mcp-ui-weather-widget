export async function getCityCoordinates(city) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`
  );
  const data = await response.json();
  if (!data.results || data?.results?.length === 0) {
    return {
      error: "City not found",
    };
  }

  const { latitude, longitude } = data.results[0];
  return {
    latitude,
    longitude,
  };
}

export async function getWeather(latitude, longitude) {
  if (!latitude || !longitude) {
    return {
      error: "Latitude and longitude are required",
    };
  }
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&current=temperature_2m,weather_code&timezone=America%2FNew_York&forecast_days=4&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`
  );
  const data = await response.json();
  return data;
}

export function renderWeatherWidget(weather) {
  const weatherCodeToIcon = [
    [[0], "☀️", "Sunny"],
    [[1, 2, 3], "🌤️", "Partly Cloudy"],
    [[45, 48], "🌥️", "Fog"],
    [[51, 53, 55], "🌧️", "Drizzle"],
    [[56, 57], "❄️", "Freezing Drizzle"],
    [[61, 63, 65], "🌧️", "Rain"],
    [[66, 67], "❄️", "Freezing Rain"],
    [[71, 73, 75], "❄️", "Snow"],
    [[77], "❄️", "Snow Grains"],
    [[80, 81, 82], "🌧️", "Rain Showers"],
    [[85, 86], "❄️", "Snow Showers"],
    [[95], "⚡️", "Thunderstorm"],
    [[96, 99], "⚡️", "Thunderstorm with Hail"],
  ];

  function getWeatherIcon(weatherCode) {
    return weatherCodeToIcon.find(([codes, icon, description]) =>
      codes.includes(weatherCode)
    )[1];
  }

  function getDateName(date) {
    const dateObj = new Date(date);
    const day = dateObj.getDay();
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return dayNames[day];
  }

  const template = `
    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); padding: 20px; max-width: 280px; width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

        <!-- Current Weather Section -->
        <div style="text-align: center; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0; margin-bottom: 15px;">
            <h2 style="margin: 0 0 5px 0; font-size: 18px; color: #333;">Current Weather</h2>
            <div style="font-size: 48px; margin: 5px 0;">${getWeatherIcon(
              weather.current.weather_code
            )}</div>
            <div style="font-size: 36px; font-weight: bold; color: #333; margin: 5px 0;">${
              weather.current.temperature_2m
            }°F</div>
        </div>

        <!-- 3-Day Forecast Section -->
        <div style="display: flex; justify-content: space-between; gap: 8px;">

            <!-- Day 1 -->
            <div style="flex: 1; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; padding: 10px 5px; color: white;">
                <div style="font-weight: 600; margin-bottom: 5px; font-size: 11px;">${getDateName(
                  weather.daily.time[0]
                )}</div>
                <div style="font-size: 28px; margin: 3px 0;">${getWeatherIcon(
                  weather.daily.weather_code[0]
                )}</div>
                <div style="font-size: 15px; font-weight: bold; margin: 3px 0;">${
                  weather.daily.temperature_2m_max[0]
                }°</div>
                <div style="font-size: 12px; opacity: 0.9;">${
                  weather.daily.temperature_2m_min[0]
                }°</div>
            </div>

            <!-- Day 2 -->
            <div style="flex: 1; text-align: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 10px; padding: 10px 5px; color: white;">
                <div style="font-weight: 600; margin-bottom: 5px; font-size: 11px;">${getDateName(
                  weather.daily.time[1]
                )}</div>
                <div style="font-size: 28px; margin: 3px 0;">${getWeatherIcon(
                  weather.daily.weather_code[1]
                )}</div>
                <div style="font-size: 15px; font-weight: bold; margin: 3px 0;">${
                  weather.daily.temperature_2m_max[1]
                }°</div>
                <div style="font-size: 12px; opacity: 0.9;">${
                  weather.daily.temperature_2m_min[1]
                }°</div>
            </div>

            <!-- Day 3 -->
            <div style="flex: 1; text-align: center; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 10px; padding: 10px 5px; color: white;">
                <div style="font-weight: 600; margin-bottom: 5px; font-size: 11px;">${getDateName(
                  weather.daily.time[2]
                )}</div>
                <div style="font-size: 28px; margin: 3px 0;">${getWeatherIcon(
                  weather.daily.weather_code[2]
                )}</div>
                <div style="font-size: 15px; font-weight: bold; margin: 3px 0;">${
                  weather.daily.temperature_2m_max[2]
                }°</div>
                <div style="font-size: 12px; opacity: 0.9;">${
                  weather.daily.temperature_2m_min[2]
                }°</div>
            </div>

        </div>
    </div>
  `;
  return template;
}
