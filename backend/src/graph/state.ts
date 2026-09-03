import { Annotation } from "@langchain/langgraph";

export const WildfireState = Annotation.Root({
  question: Annotation<string>(),

  intent: Annotation<
    "general" |
    "prevention" |
    "detection" |
    "response" |
    "policy"
  >(),

  retrievalQuery: Annotation<string>(),

  context: Annotation<string[]>(),

  retrievalScore: Annotation<number>(),

  retrievalQuality: Annotation<
    "good" | "poor"
  >(),

  retrievalAttempts: Annotation<number>(),

  answer: Annotation<string>(),
});

export type WildfireState =
  typeof WildfireState.State;