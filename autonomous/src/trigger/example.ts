import { logger, schedules } from "@trigger.dev/sdk";
import { getWeather } from "../weather/openMeteo";
import {
  evaluateWeather,
  shouldSendAlert,
} from "../rules/alertRules";
import { sendAlertEmail } from "../../email/resend";

export const autonomousWeatherCheck = schedules.task({
  id: "autonomous-weather-check",

  // Run every hour
  cron: "0 * * * *",

  maxDuration: 60,

  run: async () => {
    const weather = await getWeather();

    const result = evaluateWeather(
      weather.temperature,
      weather.rainfall
    );

    const sendAlert = shouldSendAlert(result.alert);

    logger.log("Weather check", {
      temperature: weather.temperature,
      rainfall: weather.rainfall,
      alert: result.alert,
      sendAlert,
      reasons: result.reasons,
    });

    if (sendAlert) {
      const reasonText = result.reasons.join("<br>");

      const emailResult = await sendAlertEmail(
        process.env.ALERT_RECIPIENT_EMAIL!,
        "Vanara Environmental Alert",
        `
          <h2>Environmental Alert</h2>

          <p>
            The autonomous monitoring system detected
            potentially concerning environmental conditions.
          </p>

          <p>
            <strong>Temperature:</strong> ${weather.temperature}°C
          </p>

          <p>
            <strong>Rainfall:</strong> ${weather.rainfall}mm
          </p>

          <p>
            <strong>Reason:</strong><br>
            ${reasonText}
          </p>

          <p>
            This is an automated environmental monitoring alert.
          </p>
        `
      );

      logger.log("Alert email sent", {
        emailId: emailResult?.id,
      });
    } else {
      logger.log("No alert email required");
    }

    return {
      weather,
      alert: result.alert,
      sendAlert,
      reasons: result.reasons,
    };
  },
});