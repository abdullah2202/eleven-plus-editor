import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface ShapeRecord {
  id: string;
  name: string;
  svg_content: string;
  created_at: string;
}

interface Props {
  onSelect: (svgContent: string) => void;
}

export default function ShapeSelector({ onSelect }: Props) {
  const [shapes, setShapes] = useState<ShapeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredShapes = shapes.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading shape library...</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shapes..." 
          style={{ paddingLeft: '3rem' }}
        />
      </div>

      {filteredShapes.length === 0 ? (
        <div className="p-12 text-center glass" style={{ color: 'var(--text-secondary)' }}>
          {shapes.length === 0 ? 'No shapes in library yet.' : 'No shapes match your search.'}
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
          {filteredShapes.map(shape => (
            <button 
              key={shape.id} 
              className="glass glass-interactive p-3 flex-col gap-2 items-center"
              onClick={() => onSelect(shape.svg_content)}
              style={{ textAlign: 'center', width: 'auto', height: 'auto' }}
            >
              <div style={{ width: '100%', height: '100px', background: '#111', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 500 500" width="100%" height="100%" dangerouslySetInnerHTML={{ __html: shape.svg_content }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                {shape.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
