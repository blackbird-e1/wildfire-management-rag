import playwright from "playwright";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function scrape(url: string) {
  // Launch browser
  const browser = await playwright.chromium.launch();

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  // Extract page text
  let text = await page.innerText("body");
  text = text.replace(/\n/g, " ");

  await browser.close();

  // Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
  });

  return await splitter.createDocuments([text]);
}