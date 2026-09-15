import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface PdfUploadProps {
  onUploadSuccess: () => void;
}

export default function PdfUpload({
  onUploadSuccess,
}: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] =
    useState<UploadStatus>("idle");

  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChooseFile() {
    if (status === "uploading") {
      return;
    }

    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    setFileName(file.name);
    setErrorMessage("");
    setStatus("idle");

    if (file.type !== "application/pdf") {
      setStatus("error");
      setErrorMessage("Please select a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatus("error");
      setErrorMessage("PDF must be smaller than 10 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("uploading");

      const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:3001";

      const response = await fetch(
        `${API_URL}/upload-pdf`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "PDF upload failed."
        );
      }

      setStatus("success");
      onUploadSuccess();
    } catch (error) {
      setStatus("error");

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Something went wrong while uploading the PDF."
        );
      }
    }

    event.target.value = "";
  }

  function handleReset() {
    setStatus("idle");
    setFileName("");
    setErrorMessage("");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Knowledge Sources
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          Add a PDF to the knowledge base
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
          Upload a text-based PDF and the system will
          extract, embed, and add its contents to the
          wildfire intelligence knowledge base.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {status === "success" ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
          <p className="text-sm font-medium text-green-400">
            Document uploaded successfully
          </p>

          <p className="mt-2 text-sm text-gray-400">
            {fileName}
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-600">
            The document has been added to the knowledge
            base and is ready for analysis.
          </p>

          <button
            type="button"
            onClick={handleReset}
            className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            Upload another PDF
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleChooseFile}
          disabled={status === "uploading"}
          className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center transition hover:border-red-500/40 hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-2xl">
            {status === "uploading" ? "⏳" : "📄"}
          </span>

          <span className="mt-3 text-sm font-medium text-gray-200">
            {status === "uploading"
              ? "Processing PDF..."
              : "Choose a PDF"}
          </span>

          <span className="mt-1 text-xs text-gray-600">
            Maximum file size: 10 MB
          </span>
        </button>
      )}

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-red-400">
            {errorMessage}
          </p>
        </div>
      )}
    </section>
  );
}