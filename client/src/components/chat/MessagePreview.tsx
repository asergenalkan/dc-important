import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { FileText, Image, Film, Music, File } from 'lucide-react';

interface Props {
  content: string;
  attachments?: string[];
}

export default function MessagePreview({ content, attachments = [] }: Props) {
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    const sanitizeContent = async () => {
      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      const html = await marked.parse(content);
      const sanitized = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'code',
          'pre',
          'blockquote',
          'a',
          'ul',
          'ol',
          'li',
          'span',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      });
      setSanitizedHtml(sanitized);
    };

    sanitizeContent();
  }, [content]);

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-5 h-5" />;
    }
    if (['mp4', 'webm', 'mov'].includes(extension || '')) {
      return <Film className="w-5 h-5" />;
    }
    if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return <Music className="w-5 h-5" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const renderAttachment = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return (
        <img
          src={url}
          alt="Attachment"
          className="max-w-md max-h-96 rounded-lg object-contain"
          loading="lazy"
        />
      );
    }

    if (['mp4', 'webm'].includes(extension || '')) {
      return (
        <video src={url} controls className="max-w-md max-h-96 rounded-lg" />
      );
    }

    if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return <audio src={url} controls className="max-w-md" />;
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
      >
        {getFileIcon(url)}
        <span className="text-sm text-gray-300">{url.split('/').pop()}</span>
      </a>
    );
  };

  return (
    <div className="space-y-2">
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      {attachments.length > 0 && (
        <div className="mt-2 space-y-2">
          {attachments.map((url, index) => (
            <div key={index}>{renderAttachment(url)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
