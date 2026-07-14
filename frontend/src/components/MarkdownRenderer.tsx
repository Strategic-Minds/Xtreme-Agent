import React, { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const md = useMemo(() => {
    const markdown = new MarkdownIt({
      html: false,
      linkify: true,
      typographer: true,
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (__) {}
        }
        return '';
      },
    });

    return markdown;
  }, []);

  const html = useMemo(() => {
    return md.render(content);
  }, [content, md]);

  return (
    <div className="prose prose-invert max-w-none text-sm">
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="space-y-2"
        style={{
          fontSize: '0.875rem',
        }}
      />
    </div>
  );
}
