import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    const response = await fetch("http://localhost:3001/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      }),
    });

    const data = await response.json();

    setAnswer(data.answer);
    setLoading(false);
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🔥 Wildfire RAG Assistant</h1>

        <p className="subtitle">
          Ask questions about wildfire causes, prevention and suppression.
        </p>

        <textarea
          placeholder="Example: What are the main causes of wildfires?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button onClick={askQuestion} disabled={loading}>
          {loading ? "Thinking..." : "Ask Question"}
        </button>

        <div className="answer">
          <h2>Answer</h2>

          <p>{answer || "Your answer will appear here."}</p>
        </div>
      </div>
    </div>
  );
}

export default App;