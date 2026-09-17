import { logger, schedules } from "@trigger.dev/sdk";
import { getWeather } from "../weather/openMeteo";
import {
  evaluateWeather,
  shouldSendAlert,
} from "../rules/alertRules";
import { sendAlertEmail } from "../../email/resend";
import { getActiveSubscribers } from "../../db/subscribers";

export const autonomousWeatherCheck = schedules.task({
  id: "autonomous-weather-check",

  // Run every hour
  cron: "0 * * * *",

  maxDuration: 60,

  run: async () => {
    // 1. Get current weather
    const weather = await getWeather();

    // 2. Evaluate environmental conditions
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

    // 3. Only continue if an alert is required
    if (sendAlert) {
      // 4. Get all active subscribers from Astra DB
      const subscribers = await getActiveSubscribers();

      logger.log("Active subscribers found", {
        count: subscribers.length,
      });

      // 5. Build the alert message
      const reasonText = result.reasons.join("<br>");

      const emailHtml = `
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
      `;

      // 6. Send the alert to every active subscriber
      for (const subscriber of subscribers) {
        try {
          const emailResult = await sendAlertEmail(
            subscriber.email,
            "Vanara Environmental Alert",
            emailHtml
          );

          logger.log("Alert email sent", {
            recipient: subscriber.email,
            emailId:
              emailResult && emailResult.id
                ? emailResult.id
                : undefined,
          });
        } catch (error) {
          logger.error("Failed to send alert email", {
            recipient: subscriber.email,
            error,
          });
        }
      }
    } else {
      logger.log("No alert email required");
    }

    // 7. Return the result for Trigger.dev logs
    return {
      weather,
      alert: result.alert,
      sendAlert,
      reasons: result.reasons,
    };
  },
});