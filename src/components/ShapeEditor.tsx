import { useState, useRef } from 'react';
import { Square, Circle, Triangle, Minus, Eraser, Save, RotateCcw, RotateCw } from 'lucide-react';

type Tool = 'rect' | 'circle' | 'triangle' | 'line' | 'eraser';

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
  
  const svgRef = useRef<SVGSVGElement>(null);
  const isDrawing = useRef(false);

  const getMousePos = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'eraser') return;
    isDrawing.current = true;
    const { x, y } = getMousePos(e);
    setCurrentShape({
      id: Date.now().toString(),
      type: tool,
      x, y, w: 0, h: 0,
      stroke: strokeColor,
      fill: fillColor === 'transparent' ? 'none' : fillColor,
      strokeWidth
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current || !currentShape || tool === 'eraser') return;
    const { x, y } = getMousePos(e);
    setCurrentShape(prev => prev ? {
      ...prev,
      w: x - prev.x,
      h: y - prev.y
    } : null);
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !currentShape || tool === 'eraser') return;
    isDrawing.current = false;
    // Only save if it has some size
    if (Math.abs(currentShape.w) > 5 || Math.abs(currentShape.h) > 5) {
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
    } else if (s.type === 'line') {
      return <line key={key} x1={s.x} y1={s.y} x2={s.x + s.w} y2={s.y + s.h} {...props} />;
    } else if (s.type === 'triangle') {
      const points = `${s.x + s.w/2},${s.y} ${s.x},${s.y + s.h} ${s.x + s.w},${s.y + s.h}`;
      return <polygon key={key} points={points} {...props} />;
    }
    return null;
  };

  return (
    <div className="flex-col gap-6 animate-fade-in">
      <div className="glass p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button className={tool === 'rect' ? 'primary' : 'secondary'} onClick={() => setTool('rect')}><Square size={18} /></button>
          <button className={tool === 'circle' ? 'primary' : 'secondary'} onClick={() => setTool('circle')}><Circle size={18} /></button>
          <button className={tool === 'triangle' ? 'primary' : 'secondary'} onClick={() => setTool('triangle')}><Triangle size={18} /></button>
          <button className={tool === 'line' ? 'primary' : 'secondary'} onClick={() => setTool('line')}><Minus size={18} /></button>
          <div style={{ width: '1px', background: 'var(--border-glass)', margin: '0 8px' }}></div>
          <button className={tool === 'eraser' ? 'primary' : 'secondary'} onClick={() => setTool('eraser')} style={{ color: tool === 'eraser' ? 'white' : 'var(--accent-error)' }}><Eraser size={18} /></button>
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

      <div className="flex justify-center">
        <div className="glass" style={{ width: '500px', height: '500px', overflow: 'hidden', background: canvasBg, transition: 'background 0.3s' }}>
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
  );
}
