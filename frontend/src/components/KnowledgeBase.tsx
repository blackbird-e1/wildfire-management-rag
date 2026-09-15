import PdfUpload from "./PdfUpload";

interface KnowledgeBaseProps {
  onUploadSuccess: () => void;
}

export default function KnowledgeBase({
  onUploadSuccess,
}: KnowledgeBaseProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-red-500">
          Knowledge Base
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Manage intelligence sources.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Add documents to the wildfire knowledge base
          and make them available to the RAG system.
        </p>
      </div>

      <PdfUpload
        onUploadSuccess={onUploadSuccess}
       />
    </div>
  );
}