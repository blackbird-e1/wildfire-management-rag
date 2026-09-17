import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface WeatherData {
  temperature: number;
  rainfall: number;
}

export async function getWeather(): Promise<WeatherData> {
  const latitude = 28.5458;
  const longitude = 77.1926;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,rain` +
    `&timezone=Asia%2FKolkata`;

  const { stdout } = await execFileAsync(
    "curl.exe",
    ["-4", "-s", url],
    {
      windowsHide: true,
      timeout: 15000,
    }
  );

  const data = JSON.parse(stdout) as {
    current: {
      temperature_2m: number;
      rain: number;
    };
  };

  return {
    temperature: data.current.temperature_2m,
    rainfall: data.current.rain,
  };
}