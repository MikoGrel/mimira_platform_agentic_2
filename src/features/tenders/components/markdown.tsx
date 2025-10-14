"use client";

import ReactMarkdown, { type Components } from "react-markdown";

export function Markdown({ children }: { children: string }) {
  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-base font-semibold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-semibold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold">{children}</h3>
    ),

    h4: ({ children }) => <h4 className="text-base font-medium">{children}</h4>,
    p: ({ children }) => (
      <p className="text-sm text-foreground my-2">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc text-sm text-foreground/80 space-y-1 pl-5">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal text-sm text-foreground/80 space-y-1 pl-5">
        {children}
      </ol>
    ),
    strong: ({ children }) => (
      <strong className="font-medium text-gray-900">{children}</strong>
    ),
    b: ({ children }) => (
      <b className="font-medium text-gray-900">{children}</b>
    ),
  };

  return (
    <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>
  );
}
