import fs from "fs";
import path from "path";

type Document = {
  text: string;
  $vector: number[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "vectors.json");

let documents: Document[] = [];

function loadDocuments() {
  if (documents.length > 0) {
    return;
  }

  if (!fs.existsSync(DATA_FILE)) {
    documents = [];
    return;
  }

  const file = fs.readFileSync(DATA_FILE, "utf8");
  documents = JSON.parse(file);
}

function saveDocuments() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(documents, null, 2),
    "utf8"
  );
}

export async function createCollection() {
  documents = [];
}

export async function uploadData(
  data: {
    $vector: number[];
    text: string;
  }[]
) {
  documents.push(...data);

  saveDocuments();
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function queryDatabase(
  query: number[]
): Promise<{ text: string }[]> {
  loadDocuments();

  return documents
    .map((doc) => ({
      text: doc.text,
      score: cosineSimilarity(query, doc.$vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((doc) => ({
      text: doc.text,
    }));
}