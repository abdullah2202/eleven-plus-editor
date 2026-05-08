import { useState, useEffect } from 'react';
import { Copy, Trash2, Check } from 'lucide-react';

interface ShapeRecord {
  id: string;
  name: string;
  svg_content: string;
  created_at: string;
}

export default function ShapeList() {
  const [shapes, setShapes] = useState<ShapeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchShapes = async () => {
    try {
      const res = await fetch('/api/shapes');
      if (res.ok) {
        const data = await res.json();
        setShapes(data);
      }
    } catch (err) {
      console.error('Failed to fetch shapes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShapes();
  }, []);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shape?')) return;
    try {
      const res = await fetch(`/api/shapes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setShapes(prev => prev.filter(s => s.id !== id));
      } else {
        alert('Failed to delete shape.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting shape.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading shapes...</div>;
  }

  if (shapes.length === 0) {
    return (
      <div className="glass p-8 text-center animate-fade-in" style={{ color: 'var(--text-secondary)' }}>
        No shapes saved yet. Go to the Shape Editor to create some!
      </div>
    );
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, 160px)', gap: '1rem' }}>
      {shapes.map(shape => (
        <div key={shape.id} className="glass p-3 flex-col gap-2 animate-fade-in">
          <div className="flex justify-between items-center">
            <strong style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {shape.name}
            </strong>
          </div>
          
          <div style={{ height: '120px', background: '#111', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
            <svg viewBox="0 0 500 500" width="100%" height="100%" dangerouslySetInnerHTML={{ __html: shape.svg_content }} />
          </div>
          
          <div className="flex gap-2">
            <button 
              className="secondary" 
              style={{ flex: 1, padding: '0.3rem', fontSize: '0.7rem' }}
              onClick={() => handleCopy(shape.id, shape.svg_content)}
            >
              {copiedId === shape.id ? <Check size={12} className="text-secondary" /> : <Copy size={12} />}
              {copiedId === shape.id ? 'Copied' : 'Copy'}
            </button>
            <button 
              className="secondary" 
              style={{ padding: '0.3rem', color: 'var(--accent-error)' }}
              onClick={() => handleDelete(shape.id)}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
