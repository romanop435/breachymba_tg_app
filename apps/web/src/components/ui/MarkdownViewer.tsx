import ReactMarkdown from 'react-markdown';

export function MarkdownViewer({ markdown }: { markdown: string }) {
  return (
    <div className="markdown text-sm">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
