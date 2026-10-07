import React from 'react';

/**
 * Utility to parse plain text description strings and render URLs (e.g. Google Forms, website links)
 * as clickable <a> links that open in a new tab without breaking parent click handlers.
 */
export function renderFormattedText(text) {
  if (!text || typeof text !== 'string') return null;

  // Regex to detect http://, https://, or www. URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const href = part.startsWith('www.') ? `https://${part}` : part;
      // Strip trailing punctuation like period or comma if accidentally caught at end of sentence
      const cleanHref = href.replace(/[.,;!?]$/, '');
      const cleanDisplay = part.replace(/[.,;!?]$/, '');
      const trailingPunct = part.slice(cleanDisplay.length);

      return (
        <React.Fragment key={index}>
          <a
            href={cleanHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-emerald-600 font-bold underline hover:text-emerald-700 break-all cursor-pointer inline-flex items-center gap-0.5 mx-0.5"
            title={`Open ${cleanHref}`}
          >
            <span>{cleanDisplay}</span>
            <span className="material-symbols-outlined text-[13px] inline-block leading-none">open_in_new</span>
          </a>
          {trailingPunct}
        </React.Fragment>
      );
    }

    return part;
  });
}
