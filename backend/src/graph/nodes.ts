import {
  generateEmbedding,
  generateResponse,
} from "../lib/ai";

import {
  queryDatabase,
} from "../lib/db";

import {
  type WildfireState,
} from "./state";


const STOP_WORDS = new Set([
  "what",
  "which",
  "when",
  "where",
  "who",
  "why",
  "how",
  "are",
  "is",
  "the",
  "a",
  "an",
  "of",
  "to",
  "in",
  "for",
  "on",
  "and",
  "or",
  "with",
  "does",
  "do",
]);


function getKeywords(
  text: string
): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 4 &&
        !STOP_WORDS.has(word)
    );
}


/*
 * NODE 1
 *
 * Classify the question.
 *
 * This is intentionally deterministic.
 * No additional LLM call.
 */
export async function classifyNode(
  state: WildfireState
) {
  const question =
    state.question.toLowerCase();

  let intent:
    | "general"
    | "prevention"
    | "detection"
    | "response"
    | "policy" = "general";

  if (
    /evacuat|emergency|incident|response|shelter|firefighter|suppression/.test(
      question
    )
  ) {
    intent = "response";
  } else if (
    /detect|detection|sensor|satellite|smoke|monitor|early warning/.test(
      question
    )
  ) {
    intent = "detection";
  } else if (
    /prevent|prevention|mitigation|fuel|prescribed|controlled burn/.test(
      question
    )
  ) {
    intent = "prevention";
  } else if (
    /law|policy|regulation|regulatory|agency|standard|guideline/.test(
      question
    )
  ) {
    intent = "policy";
  }

  console.log(
    `[Graph] classified as: ${intent}`
  );

  return {
    intent,
    retrievalQuery: state.question,
  };
}


/*
 * NODE 2
 *
 * Retrieve documents from Astra.
 */
export async function retrieveNode(
  state: WildfireState
) {
  const attempt =
    (state.retrievalAttempts ?? 0) + 1;

  console.log(
    `[Graph] retrieval attempt: ${attempt}`
  );

  const embedding =
    await generateEmbedding(
      state.retrievalQuery
    );

  const docs =
    await queryDatabase(embedding);

  const context =
    docs
      .map((doc) => doc.text)
      .filter(
        (text): text is string =>
          typeof text === "string" &&
          text.trim().length > 0
      );

  console.log(
    `[Graph] retrieved ${context.length} documents`
  );

  return {
    context,
    retrievalAttempts: attempt,
  };
}


/*
 * NODE 3
 *
 * Evaluate retrieval quality.
 *
 * For now this is deterministic and free.
 */
export async function evaluateNode(
  state: WildfireState
) {
  const questionKeywords =
    getKeywords(state.question);

  const contextText =
    state.context
      .join(" ")
      .toLowerCase();

  if (
    state.context.length === 0 ||
    questionKeywords.length === 0
  ) {
    return {
      retrievalScore: 0,
      retrievalQuality: "poor" as const,
    };
  }

  const matchedKeywords =
    questionKeywords.filter(
      (keyword) =>
        contextText.includes(keyword)
    );

  const score =
    matchedKeywords.length /
    questionKeywords.length;

  const quality =
    score >= 0.15
      ? "good"
      : "poor";

  console.log(
    `[Graph] retrieval score: ${score.toFixed(2)}`
  );

  console.log(
    `[Graph] retrieval quality: ${quality}`
  );

  return {
    retrievalScore: score,
    retrievalQuality: quality as
      | "good"
      | "poor",
  };
}


/*
 * NODE 4
 *
 * Rewrite the retrieval query if
 * the first retrieval was poor.
 *
 * No LLM call.
 */
export async function rewriteNode(
  state: WildfireState
) {
  const intentTerms: Record<
    WildfireState["intent"],
    string
  > = {
    general:
      "wildfire management",

    prevention:
      "wildfire prevention mitigation",

    detection:
      "wildfire detection monitoring early warning",

    response:
      "wildfire emergency response suppression evacuation",

    policy:
      "wildfire policy regulation guidelines",
  };

  const rewrittenQuery =
    `${intentTerms[state.intent]} ${state.question}`;

  console.log(
    `[Graph] rewritten query: ${rewrittenQuery}`
  );

  return {
    retrievalQuery: rewrittenQuery,
  };
}


/*
 * NODE 5
 *
 * Generate the final answer.
 *
 * This still uses your existing Groq
 * implementation.
 */
export async function generateNode(
  state: WildfireState
) {
  console.log(
    "[Graph] generating answer"
  );

  const answer =
    await generateResponse(
      state.question,
      state.context
    );

  return {
    answer,
  };
}