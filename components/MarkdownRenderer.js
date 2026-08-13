'use client';

import React from 'react';

/**
 * Rendu Markdown léger et performant (titres, blocs de code, listes, liens, emphase).
 * @param {{ content: string, className?: string }} props
 */
export default function MarkdownRenderer({ content = '', className = '' }) {
  if (!content) {
    return <p className="text-xs text-gray-500 italic">Note vide</p>;
  }

  // Découpage en blocs (lignes vides ou blocs de code)
  const renderContent = (rawText) => {
    const lines = rawText.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockBuffer = [];
    let listBuffer = [];
    let isOrderedList = false;

    const flushList = () => {
      if (listBuffer.length === 0) return;
      if (isOrderedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 text-xs text-gray-300">
            {listBuffer.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 text-xs text-gray-300">
            {listBuffer.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ul>
        );
      }
      listBuffer = [];
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Gestion des blocs de code ```
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${index}`} className="my-3 rounded-xl overflow-hidden bg-cyber-surface border border-gray-800 shadow-cyber-sm">
              {codeBlockLang && (
                <div className="px-3.5 py-1.5 bg-cyber-card/80 border-b border-gray-800 text-[10px] font-mono font-semibold text-cyber-accent uppercase tracking-wider">
                  {codeBlockLang}
                </div>
              )}
              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                <code>{codeBlockBuffer.join('\n')}</code>
              </pre>
            </div>
          );
          codeBlockBuffer = [];
          inCodeBlock = false;
          codeBlockLang = '';
        } else {
          flushList();
          inCodeBlock = true;
          codeBlockLang = trimmed.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        return;
      }

      // Gestion des éléments de liste
      const unorderedMatch = line.match(/^[-*]\s+(.*)/);
      const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);

      if (unorderedMatch) {
        if (isOrderedList && listBuffer.length > 0) flushList();
        isOrderedList = false;
        listBuffer.push(unorderedMatch[1]);
        return;
      } else if (orderedMatch) {
        if (!isOrderedList && listBuffer.length > 0) flushList();
        isOrderedList = true;
        listBuffer.push(orderedMatch[2]);
        return;
      } else {
        flushList();
      }

      // Lignes vides
      if (!trimmed) {
        return;
      }

      // Titres H1 à H4
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${index}`} className="text-lg font-black text-white mt-4 mb-2 tracking-tight">
            {parseInline(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-base font-bold text-white mt-3.5 mb-1.5 tracking-tight">
            {parseInline(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-sm font-bold text-cyber-accent mt-3 mb-1">
            {parseInline(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={`quote-${index}`} className="my-2 pl-3 py-1 bg-cyber-card/50 rounded-r-lg text-xs text-gray-300 italic shadow-cyber-sm">
            {parseInline(line.slice(2))}
          </blockquote>
        );
      } else {
        elements.push(
          <p key={`p-${index}`} className="text-xs text-gray-300 leading-relaxed my-1">
            {parseInline(line)}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  /**
   * Formatage en ligne (code, gras, italien, liens)
   */
  const parseInline = (text) => {
    // Remplacement simple des backticks `code`
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-cyber-surface text-cyber-accent text-[11px] font-mono border border-gray-800">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Formatage du gras **text**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, j) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return <strong key={j} className="font-bold text-white">{bPart.slice(2, -2)}</strong>;
        }

        // Formatage des liens [text](url)
        const linkMatch = bPart.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const [full, linkText, url] = linkMatch;
          const pre = bPart.substring(0, bPart.indexOf(full));
          const post = bPart.substring(bPart.indexOf(full) + full.length);
          return (
            <React.Fragment key={j}>
              {pre}
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyber-accent hover:underline font-semibold">
                {linkText}
              </a>
              {post}
            </React.Fragment>
          );
        }

        return bPart;
      });
    });
  };

  return <div className={`space-y-1 ${className}`}>{renderContent(content)}</div>;
}
