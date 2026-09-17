import { Resend } from "resend";
import "dotenv/config";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not configured");
}

const resend = new Resend(apiKey);

export async function sendAlertEmail(
  recipient: string,
  subject: string,
  message: string
) {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: recipient,
    subject,
    html: `<p>${message}</p>`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}