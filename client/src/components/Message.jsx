import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Markdown({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-ocean-700">{children}</strong>
        ),
        ul: ({ children }) => <ul className="mb-2 list-disc pl-5 space-y-1 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 space-y-1 last:mb-0">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        code: ({ children }) => (
          <code className="bg-ocean-200/60 text-ocean-800 px-1 py-0.5 rounded text-[0.85em]">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="mb-2 p-3 rounded-lg bg-ocean-900 text-ocean-50 text-[0.85rem] overflow-x-auto last:mb-0">
            {children}
          </pre>
        ),
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-ocean-500 underline underline-offset-2 hover:text-ocean-600">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="mb-2 overflow-x-auto last:mb-0">
            <table className="min-w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-ocean-300 bg-ocean-200/50 px-2 py-1 text-left">{children}</th>
        ),
        td: ({ children }) => <td className="border border-ocean-300 px-2 py-1">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 msg-enter`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-400 flex items-center justify-center mr-2.5 mt-1 shadow-ocean-sm">
          <span className="text-white text-xs font-semibold">AI</span>
        </div>
      )}

      <div
        className={`max-w-[75%] px-4 py-2.5 text-[0.9rem] leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-ocean-500 to-ocean-600 text-white rounded-2xl rounded-br-md shadow-ocean-md"
            : "bg-white text-ocean-900 rounded-2xl rounded-bl-md shadow-ocean-sm border border-ocean-200/60"
        }`}
      >
        {isUser ? message.content : <Markdown content={message.content} />}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ocean-200 flex items-center justify-center ml-2.5 mt-1">
          <svg className="w-4 h-4 text-ocean-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}