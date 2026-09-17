export interface WeatherAlert {
  alert: boolean;
  reasons: string[];
}

export function evaluateWeather(
  temperature: number,
  rainfall: number
): WeatherAlert {
  const reasons: string[] = [];

  // Normal production rules
  if (temperature >= 40) {
    reasons.push(`High temperature: ${temperature}°C`);
  }

  if (rainfall >= 50) {
    reasons.push(`Heavy rainfall: ${rainfall}mm`);
  }

  // Temporary testing mode
  if (process.env.TEST_ALERT === "true") {
    reasons.push("Test alert triggered manually");
  }

  return {
    alert: reasons.length > 0,
    reasons,
  };
}

let alertActive = false;

export function shouldSendAlert(alert: boolean): boolean {
  if (alert && !alertActive) {
    alertActive = true;
    return true;
  }

  if (!alert) {
    alertActive = false;
  }

  return false;
}