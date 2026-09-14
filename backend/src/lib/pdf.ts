import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

export async function extractPdfText(
  buffer: Buffer
): Promise<string> {
  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  await parser.destroy();

  return result.text;
}

export async function chunkPdf(
  buffer: Buffer
) {
  const text = await extractPdfText(buffer);

  return splitter.createDocuments([text]);
}