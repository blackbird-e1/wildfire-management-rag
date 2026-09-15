export interface MessageSource {
  source: string;
  sourceType: "url" | "pdf";
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
  sources?: MessageSource[];
}