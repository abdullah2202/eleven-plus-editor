import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  data: any;
}

export default function JSONPreview({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex-col" style={{ flex: 1, minHeight: '300px', maxWidth: '100%', overflow: 'hidden' }}>
      <button 
        className="secondary" 
        onClick={handleCopy}
        style={{ 
          position: 'absolute', 
          top: '1rem', 
          right: '1rem', 
          padding: '0.4rem 0.8rem',
          fontSize: '0.8rem'
        }}
      >
        {copied ? <Check size={14} className="text-secondary" /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      
      <pre 
        style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '1.5rem', 
          borderRadius: '12px',
          fontSize: '0.9rem',
          overflow: 'auto',
          maxWidth: '100%',
          flex: 1,
          border: '1px solid var(--border-glass)',
          margin: 0,
          color: '#e2e8f0',
          fontFamily: 'monospace'
        }}
      >
        {jsonString}
      </pre>
    </div>
  );
}
