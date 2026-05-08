import { useState } from 'react';
import type { NVRQuestion, NVRShapeType, SVGItem } from '../types';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Modal from './Modal';
import ShapeSelector from './ShapeSelector';

interface Props {
  data: NVRQuestion;
  onChange: (data: NVRQuestion) => void;
}

export default function NVREditor({ data, onChange }: Props) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState<{ type: 'sequence' | 'option', index: number } | null>(null);

  const updateField = (field: keyof NVRQuestion, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateOption = (index: number, field: keyof SVGItem, value: string) => {
    const newOptions = [...data.svgOptions] as [SVGItem, SVGItem, SVGItem, SVGItem];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateField('svgOptions', newOptions);
  };

  const updateSequence = (index: number, field: keyof SVGItem, value: string) => {
    const newSequence = [...(data.svgSequence || [])];
    newSequence[index] = { ...newSequence[index], [field]: value };
    updateField('svgSequence', newSequence);
  };

  const addSequenceItem = () => {
    const newSequence = [...(data.svgSequence || []), { svg: '', viewBox: '0 0 64 64' }];
    updateField('svgSequence', newSequence);
  };

  const removeSequenceItem = (index: number) => {
    const newSequence = (data.svgSequence || []).filter((_, i) => i !== index);
    updateField('svgSequence', newSequence);
  };

  const openSelector = (type: 'sequence' | 'option', index: number) => {
    setSelectorTarget({ type, index });
    setSelectorOpen(true);
  };

  const handleShapeSelect = (svgContent: string) => {
    if (!selectorTarget) return;

    if (selectorTarget.type === 'sequence') {
      const newSequence = [...(data.svgSequence || [])];
      newSequence[selectorTarget.index] = { 
        svg: svgContent, 
        viewBox: '0 0 500 500' // Shapes from editor are 500x500
      };
      updateField('svgSequence', newSequence);
    } else {
      const newOptions = [...data.svgOptions] as [SVGItem, SVGItem, SVGItem, SVGItem];
      newOptions[selectorTarget.index] = { 
        svg: svgContent, 
        viewBox: '0 0 500 500' 
      };
      updateField('svgOptions', newOptions);
    }
    setSelectorOpen(false);
  };

  return (
    <div className="flex-col gap-6">
      <div className="input-group">
        <label>Puzzle Type</label>
        <select value={data.shapeType} onChange={(e) => updateField('shapeType', e.target.value)}>
          <option value="sequence">Sequence</option>
          <option value="odd_one_out">Odd One Out</option>
        </select>
      </div>

      {data.shapeType === 'sequence' && (
        <div className="flex-col gap-3">
          <div className="flex justify-between items-center">
            <label>Leading Sequence</label>
            <button className="secondary" onClick={addSequenceItem} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
              <Plus size={12} /> Add Step
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            {data.svgSequence?.map((item, i) => (
              <div key={i} className="flex-col gap-2 glass p-3" style={{ width: '120px' }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Step {i + 1}</span>
                  <button onClick={() => removeSequenceItem(i)} style={{ padding: '0.2rem', color: 'var(--accent-error)' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ height: '60px', background: 'white', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox={item.viewBox} width="100%" height="100%" dangerouslySetInnerHTML={{ __html: item.svg }} />
                </div>
                <button 
                  className="secondary"
                  onClick={() => openSelector('sequence', i)}
                  style={{ fontSize: '0.7rem', padding: '0.4rem' }}
                >
                  <ImageIcon size={12} /> Select Shape
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-col gap-3">
        <label>Answer Options (4)</label>
        <div className="grid-2" style={{ gap: '1rem' }}>
          {data.svgOptions.map((option, i) => (
            <div key={i} className="glass p-4 flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="nvrCorrectIndex" 
                    checked={data.correctIndex === i} 
                    onChange={() => updateField('correctIndex', i)}
                    style={{ width: 'auto' }}
                  />
                  Option {i + 1}
                </label>
              </div>
              <div style={{ height: '80px', background: 'white', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox={option.viewBox} width="100%" height="100%" dangerouslySetInnerHTML={{ __html: option.svg }} />
              </div>
              <button 
                className="secondary"
                onClick={() => openSelector('option', i)}
                style={{ fontSize: '0.8rem' }}
              >
                <ImageIcon size={14} /> Select Shape
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label>Explanation</label>
        <textarea 
          rows={3} 
          value={data.explanation} 
          onChange={(e) => updateField('explanation', e.target.value)}
          placeholder="Explain the visual logic..."
        />
      </div>

      <Modal 
        isOpen={selectorOpen} 
        onClose={() => setSelectorOpen(false)} 
        title="Select Shape from Library"
      >
        <ShapeSelector onSelect={handleShapeSelect} />
      </Modal>
    </div>
  );
}
