import {
  END,
  START,
  StateGraph,
} from "@langchain/langgraph";

import {
  WildfireState,
} from "./state";

import {
  classifyNode,
  retrieveNode,
  evaluateNode,
  rewriteNode,
  generateNode,
  generateReportNode,
} from "./nodes";


function routeAfterEvaluation(
  state: typeof WildfireState.State
) {
  if (
    state.retrievalQuality === "good"
  ) {
    return "generate";
  }

  if (
    state.retrievalAttempts >= 2
  ) {
    console.log(
      "[Graph] maximum retrieval attempts reached"
    );

    return "generate";
  }

  return "rewrite";
}

function routeAfterEvaluationForReport(
  state: typeof WildfireState.State
) {
  if (
    state.retrievalQuality === "good"
  ) {
    return "generateReport";
  }

  if (
    state.retrievalAttempts >= 2
  ) {
    console.log(
      "[Graph] maximum retrieval attempts reached"
    );

    return "generateReport";
  }

  return "rewrite";
}


export const wildfireGraph =
  new StateGraph(WildfireState)

    .addNode(
      "classify",
      classifyNode
    )

    .addNode(
      "retrieve",
      retrieveNode
    )

    .addNode(
      "evaluate",
      evaluateNode
    )

    .addNode(
      "rewrite",
      rewriteNode
    )

    .addNode(
      "generate",
      generateNode
    )

    .addEdge(
      START,
      "classify"
    )

    .addEdge(
      "classify",
      "retrieve"
    )

    .addEdge(
      "retrieve",
      "evaluate"
    )

    .addConditionalEdges(
      "evaluate",
      routeAfterEvaluation,
      {
        generate: "generate",
        rewrite: "rewrite",
      }
    )

    .addEdge(
      "rewrite",
      "retrieve"
    )

    .addEdge(
      "generate",
      END
    )

    .compile();

export const wildfireReportGraph =
  new StateGraph(WildfireState)

    .addNode(
      "classify",
      classifyNode
    )

    .addNode(
      "retrieve",
      retrieveNode
    )

    .addNode(
      "evaluate",
      evaluateNode
    )

    .addNode(
      "rewrite",
      rewriteNode
    )

    .addNode(
      "generateReport",
      generateReportNode
    )

    .addEdge(
      START,
      "classify"
    )

    .addEdge(
      "classify",
      "retrieve"
    )

    .addEdge(
      "retrieve",
      "evaluate"
    )

    .addConditionalEdges(
      "evaluate",
      routeAfterEvaluationForReport,
      {
        generateReport: "generateReport",
        rewrite: "rewrite",
      }
    )

    .addEdge(
      "rewrite",
      "retrieve"
    )

    .addEdge(
      "generateReport",
      END
    )

    .compile();


export async function generateWildfireReport(
  question: string
) {
  return wildfireReportGraph.invoke({
    question,
  });
}

export async function askWildfireGraph(
  question: string
) {
  return wildfireGraph.invoke({
    question,
  });
}