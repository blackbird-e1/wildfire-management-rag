import https from "https";
import fetch from "node-fetch";

const httpsAgent = new https.Agent({
  keepAlive: true,
});

export const langsmithFetch = (
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> => {
  return fetch(input.toString(), {
    ...(init as any),
    agent: httpsAgent,
  }) as unknown as Promise<Response>;
};