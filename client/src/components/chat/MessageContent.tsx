import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

interface Props {
  content: string;
  className?: string;
}

export default function MessageContent({ content, className = '' }: Props) {
  const sanitizedHtml = useMemo(() => {
    // Configure marked for synchronous operation
    marked.setOptions({
      async: false,
    });
    
    // Markdown'ı senkron olarak ayrıştır ve string olarak belirt
    const html = marked.parse(content) as string;
    
    // Sanitize the HTML
    return DOMPurify.sanitize(html);
  }, [content]);

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
