import { useState, useRef, useEffect } from 'react';
import { Square, Circle, Triangle, Minus, Eraser, Save, RotateCcw, RotateCw, MousePointer2, Hexagon, PenTool } from 'lucide-react';

type Tool = 'rect' | 'circle' | 'ellipse' | 'triangle' | 'line' | 'path' | 'eraser';

interface SVGShape {
  id: string;
  type: Tool;
  x: number;
  y: number;
  w: number;
  h: number;
  stroke: string;
  fill: string;
  strokeWidth: number;
  d?: string; // For path tool
}

export default function ShapeEditor() {
  const [shapes, setShapes] = useState<SVGShape[]>([]);
  const [currentShape, setCurrentShape] = useState<SVGShape | null>(null);
  const [tool, setTool] = useState<Tool>('rect');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [rotation, setRotation] = useState(0);
  const [shapeName, setShapeName] = useState('');
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [svgCode, setSvgCode] = useState('');
  const [isManualEditing, setIsManualEditing] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const isDrawing = useRef(false);

  const getMousePos = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    return {
      x: transformedPoint.x,
      y: transformedPoint.y
    };
  };

  const generateSvgCode = (shapesArr: SVGShape[]) => {
    return shapesArr.map(s => {
      const rx = s.w < 0 ? s.x + s.w : s.x;
      const ry = s.h < 0 ? s.y + s.h : s.y;
      const rw = Math.abs(s.w);
      const rh = Math.abs(s.h);
      const fill = s.fill === 'transparent' ? 'none' : s.fill;
      
      if (s.type === 'rect') {
        return `  <rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" stroke="${s.stroke}" fill="${fill}" stroke-width="${s.strokeWidth}" />`;
      } else if (s.type === 'circle') {
        const r = Math.sqrt(rw*rw + rh*rh) / 2;
        return `  <circle cx="${(s.x + s.w/2).toFixed(1)}" cy="${(s.y + s.h/2).toFixed(1)}" r="${r.toFixed(1)}" stroke="${s.stroke}" fill="${fill}" stroke-width="${s.strokeWidth}" />`;
      } else if (s.type === 'ellipse') {
        return `  <ellipse cx="${(s.x + s.w/2).toFixed(1)}" cy="${(s.y + s.h/2).toFixed(1)}" rx="${(rw/2).toFixed(1)}" ry="${(rh/2).toFixed(1)}" stroke="${s.stroke}" fill="${fill}" stroke-width="${s.strokeWidth}" />`;
      } else if (s.type === 'line') {
        return `  <line x1="${s.x.toFixed(1)}" y1="${s.y.toFixed(1)}" x2="${(s.x + s.w).toFixed(1)}" y2="${(s.y + s.h).toFixed(1)}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" />`;
      } else if (s.type === 'triangle') {
        const points = `${(s.x + s.w/2).toFixed(1)},${s.y.toFixed(1)} ${s.x.toFixed(1)},${(s.y + s.h).toFixed(1)} ${(s.x + s.w).toFixed(1)},${(s.y + s.h).toFixed(1)}`;
        return `  <polygon points="${points}" stroke="${s.stroke}" fill="${fill}" stroke-width="${s.strokeWidth}" />`;
      } else if (s.type === 'path') {
        return `  <path d="${s.d}" stroke="${s.stroke}" fill="${fill}" stroke-width="${s.strokeWidth}" fill-rule="evenodd" stroke-linejoin="round" stroke-linecap="round" />`;
      }
      return '';
    }).join('\n');
  };

  useEffect(() => {
    if (!isManualEditing) {
      setSvgCode(generateSvgCode(shapes));
    }
  }, [shapes, isManualEditing]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setSvgCode(newCode);
    setIsManualEditing(true);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<svg>${newCode}</svg>`, 'image/svg+xml');
      const elements = Array.from(doc.documentElement.children);
      
      const newShapes: SVGShape[] = elements.map((el, i) => {
        const typeAttr = el.tagName.toLowerCase();
        const stroke = el.getAttribute('stroke') || '#000000';
        const fill = el.getAttribute('fill') || 'none';
        const strokeWidth = parseInt(el.getAttribute('stroke-width') || '1');
        
        let shape: Partial<SVGShape> = {
          id: `parsed-${i}`,
          stroke,
          fill: fill === 'none' ? 'transparent' : fill,
          strokeWidth
        };

        if (typeAttr === 'rect') {
          shape = { ...shape, type: 'rect', x: parseFloat(el.getAttribute('x') || '0'), y: parseFloat(el.getAttribute('y') || '0'), w: parseFloat(el.getAttribute('width') || '0'), h: parseFloat(el.getAttribute('height') || '0') };
        } else if (typeAttr === 'circle') {
          const r = parseFloat(el.getAttribute('r') || '0');
          const cx = parseFloat(el.getAttribute('cx') || '0');
          const cy = parseFloat(el.getAttribute('cy') || '0');
          shape = { ...shape, type: 'circle', x: cx - r, y: cy - r, w: r * 2, h: r * 2 };
        } else if (typeAttr === 'ellipse') {
          const rx = parseFloat(el.getAttribute('rx') || '0');
          const ry = parseFloat(el.getAttribute('ry') || '0');
          const cx = parseFloat(el.getAttribute('cx') || '0');
          const cy = parseFloat(el.getAttribute('cy') || '0');
          shape = { ...shape, type: 'ellipse', x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2 };
        } else if (typeAttr === 'line') {
          const x1 = parseFloat(el.getAttribute('x1') || '0');
          const y1 = parseFloat(el.getAttribute('y1') || '0');
          const x2 = parseFloat(el.getAttribute('x2') || '0');
          const y2 = parseFloat(el.getAttribute('y2') || '0');
          shape = { ...shape, type: 'line', x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        } else if (typeAttr === 'polygon') {
          // Simplified polygon to triangle for our internal model if it has 3 points
          const points = el.getAttribute('points') || '';
          const pts = points.split(/[\s,]+/).map(parseFloat);
          if (pts.length >= 6) {
             // For simplicity, we just take bounding box and treat as triangle
             shape = { ...shape, type: 'triangle', x: Math.min(pts[0], pts[2], pts[4]), y: Math.min(pts[1], pts[3], pts[5]), w: Math.max(pts[0], pts[2], pts[4]) - Math.min(pts[0], pts[2], pts[4]), h: Math.max(pts[1], pts[3], pts[5]) - Math.min(pts[1], pts[3], pts[5]) };
          }
        } else if (typeAttr === 'path') {
          shape = { ...shape, type: 'path', d: el.getAttribute('d') || '', x: 0, y: 0, w: 0, h: 0 };
        } else {
          return null;
        }
        return shape as SVGShape;
      }).filter((s): s is SVGShape => s !== null);

      if (newShapes.length > 0 || newCode.trim() === '') {
        setShapes(newShapes);
      }
    } catch (err) {
      console.error('Failed to parse SVG code', err);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'eraser') return;
    setIsManualEditing(false);
    isDrawing.current = true;
    const { x, y } = getMousePos(e);
    setCurrentShape({
      id: Date.now().toString(),
      type: tool,
      x, y, w: 0, h: 0,
      stroke: strokeColor,
      fill: fillColor === 'transparent' ? 'none' : fillColor,
      strokeWidth,
      d: tool === 'path' ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : undefined
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current || !currentShape || tool === 'eraser') return;
    const { x, y } = getMousePos(e);
    
    if (tool === 'path') {
      setCurrentShape(prev => prev ? {
        ...prev,
        d: prev.d + ` L ${x.toFixed(1)} ${y.toFixed(1)}`
      } : null);
    } else {
      setCurrentShape(prev => prev ? {
        ...prev,
        w: x - prev.x,
        h: y - prev.y
      } : null);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !currentShape || tool === 'eraser') return;
    isDrawing.current = false;
    
    // Check if it has some size or is a path
    const hasSize = Math.abs(currentShape.w) > 5 || Math.abs(currentShape.h) > 5;
    const isPath = currentShape.type === 'path' && (currentShape.d?.length || 0) > 10;

    if (hasSize || isPath) {
      setShapes(prev => [...prev, currentShape]);
    }
    setCurrentShape(null);
  };

  const handleShapeClick = (id: string, e: React.MouseEvent) => {
    if (tool === 'eraser') {
      e.stopPropagation();
      setShapes(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSave = async () => {
    if (!shapeName.trim()) {
      alert('Please enter a name for the shape.');
      return;
    }

    if (!svgRef.current) return;
    
    // We get the inner HTML of the SVG to save the exact paths
    // We wrap it in a group with the current rotation
    const innerContent = Array.from(svgRef.current.children).map(c => c.outerHTML).join('');
    const finalSvgContent = `<g transform="rotate(${rotation} 250 250)">${innerContent}</g>`;

    try {
      const res = await fetch('/api/shapes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: shapeName, svg_content: finalSvgContent })
      });
      if (res.ok) {
        alert('Shape saved successfully!');
        setShapeName('');
        setShapes([]);
        setRotation(0);
      } else {
        alert('Failed to save shape.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving shape.');
    }
  };

  const renderShape = (s: SVGShape, isCurrent = false) => {
    const rx = s.w < 0 ? s.x + s.w : s.x;
    const ry = s.h < 0 ? s.y + s.h : s.y;
    const rw = Math.abs(s.w);
    const rh = Math.abs(s.h);
    
    const key = isCurrent ? 'current' : s.id;
    const props = {
      stroke: s.stroke,
      fill: s.fill,
      strokeWidth: s.strokeWidth,
      onClick: (e: React.MouseEvent) => !isCurrent && handleShapeClick(s.id, e),
      style: { cursor: tool === 'eraser' ? 'crosshair' : 'default' }
    };

    if (s.type === 'rect') {
      return <rect key={key} x={rx} y={ry} width={rw} height={rh} {...props} />;
    } else if (s.type === 'circle') {
      const r = Math.sqrt(rw*rw + rh*rh) / 2;
      return <circle key={key} cx={s.x + s.w/2} cy={s.y + s.h/2} r={r} {...props} />;
    } else if (s.type === 'ellipse') {
      return <ellipse key={key} cx={s.x + s.w/2} cy={s.y + s.h/2} rx={rw/2} ry={rh/2} {...props} />;
    } else if (s.type === 'line') {
      return <line key={key} x1={s.x} y1={s.y} x2={s.x + s.w} y2={s.y + s.h} {...props} />;
    } else if (s.type === 'triangle') {
      const points = `${s.x + s.w/2},${s.y} ${s.x},${s.y + s.h} ${s.x + s.w},${s.y + s.h}`;
      return <polygon key={key} points={points} {...props} />;
    } else if (s.type === 'path') {
      return <path key={key} d={s.d} {...props} fillRule="evenodd" strokeLinejoin="round" strokeLinecap="round" />;
    }
    return null;
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="glass p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button className={tool === 'rect' ? 'primary' : 'secondary'} onClick={() => setTool('rect')} title="Rectangle"><Square size={18} /></button>
          <button className={tool === 'circle' ? 'primary' : 'secondary'} onClick={() => setTool('circle')} title="Circle"><Circle size={18} /></button>
          <button className={tool === 'ellipse' ? 'primary' : 'secondary'} onClick={() => setTool('ellipse')} title="Ellipse"><Hexagon size={18} /></button>
          <button className={tool === 'triangle' ? 'primary' : 'secondary'} onClick={() => setTool('triangle')} title="Triangle"><Triangle size={18} /></button>
          <button className={tool === 'line' ? 'primary' : 'secondary'} onClick={() => setTool('line')} title="Line"><Minus size={18} /></button>
          <button className={tool === 'path' ? 'primary' : 'secondary'} onClick={() => setTool('path')} title="Path"><PenTool size={18} /></button>
          <div style={{ width: '1px', background: 'var(--border-glass)', margin: '0 8px' }}></div>
          <button className={tool === 'eraser' ? 'primary' : 'secondary'} onClick={() => setTool('eraser')} style={{ color: tool === 'eraser' ? 'white' : 'var(--accent-error)' }} title="Eraser"><Eraser size={18} /></button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label style={{ margin: 0 }}>Stroke:</label>
            <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} style={{ padding: 0, width: '30px', height: '30px', border: 'none', background: 'transparent' }} />
          </div>
          <div className="flex items-center gap-2">
            <label style={{ margin: 0 }}>Fill:</label>
            <select value={fillColor} onChange={e => setFillColor(e.target.value)} style={{ padding: '0.2rem 0.5rem', width: 'auto' }}>
              <option value="transparent">None</option>
              <option value="#ffffff">White</option>
              <option value="#000000">Black</option>
              <option value="#7c3aed">Violet</option>
              <option value="#0d9488">Teal</option>
              <option value="#e11d48">Rose</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label style={{ margin: 0 }}>Width:</label>
            <input type="number" min="1" max="20" value={strokeWidth} onChange={e => setStrokeWidth(parseInt(e.target.value))} style={{ padding: '0.2rem 0.5rem', width: '60px' }} />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <label style={{ margin: 0 }}>Rotate:</label>
          <button className="secondary" onClick={() => setRotation(r => r - 15)} style={{ padding: '0.3rem' }}><RotateCcw size={16} /></button>
          <span style={{ minWidth: '40px', textAlign: 'center' }}>{rotation}°</span>
          <button className="secondary" onClick={() => setRotation(r => r + 15)} style={{ padding: '0.3rem' }}><RotateCw size={16} /></button>
        </div>

        <div className="flex items-center gap-2">
          <label style={{ margin: 0 }}>Canvas:</label>
          <input type="color" value={canvasBg} onChange={e => setCanvasBg(e.target.value)} style={{ padding: 0, width: '30px', height: '30px', border: 'none', background: 'transparent' }} />
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start' }}>
        <div className="flex flex-col gap-4">
          <div className="glass" style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: canvasBg, transition: 'background 0.3s', position: 'relative' }}>
            <svg 
              ref={svgRef}
              viewBox="0 0 500 500" 
              width="100%" 
              height="100%" 
              style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.2s', cursor: tool === 'eraser' ? 'crosshair' : 'crosshair' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {shapes.map(s => renderShape(s))}
              {currentShape && renderShape(currentShape, true)}
            </svg>
          </div>
          
          <div className="glass p-4 flex gap-4 items-center">
            <input 
              placeholder="Enter shape name..." 
              value={shapeName} 
              onChange={e => setShapeName(e.target.value)} 
              style={{ flex: 1 }}
            />
            <button className="primary" onClick={handleSave}>
              <Save size={18} /> Save to Library
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full">
          <div className="glass p-4 flex flex-col gap-3" style={{ height: 'calc(100% - 0px)', minHeight: '500px' }}>
            <div className="flex justify-between items-center">
              <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PenTool size={14} /> Live SVG Code
              </label>
              {isManualEditing && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>Manual Edit Mode</span>
              )}
            </div>
            <textarea
              value={svgCode}
              onChange={handleCodeChange}
              spellCheck={false}
              placeholder="SVG code will appear here..."
              style={{ 
                flex: 1, 
                fontFamily: 'monospace', 
                fontSize: '0.875rem', 
                background: 'rgba(0,0,0,0.2)',
                color: '#10b981',
                resize: 'none',
                lineHeight: '1.4'
              }}
            />
            <div className="flex justify-end">
               <button className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setIsManualEditing(false)}>
                  Reset to Sync
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
