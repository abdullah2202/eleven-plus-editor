import type { VRQuestion, VRTopic } from '../types';

interface Props {
  data: VRQuestion;
  onChange: (data: VRQuestion) => void;
}

const TOPICS: VRTopic[] = ['analogies', 'odd_one_out', 'synonyms', 'antonyms', 'number_sequence', 'letter_sequence'];

export default function VREditor({ data, onChange }: Props) {
  const updateField = (field: keyof VRQuestion, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...data.options] as [string, string, string, string];
    newOptions[index] = value;
    updateField('options', newOptions);
  };

  return (
    <div className="flex-col gap-4">
      <div className="input-group">
        <label>Question Topic</label>
        <select value={data.topic} onChange={(e) => updateField('topic', e.target.value)}>
          {TOPICS.map(topic => (
            <option key={topic} value={topic}>{topic.replace(/_/g, ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label>Question Text</label>
        <textarea 
          rows={3} 
          value={data.question} 
          onChange={(e) => updateField('question', e.target.value)}
          placeholder="Enter the main question or sequence..."
        />
      </div>

      <div className="grid-2" style={{ gap: '1rem' }}>
        {data.options.map((option, i) => (
          <div key={i} className="input-group" style={{ marginBottom: '0.5rem' }}>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="correctIndex" 
                checked={data.correctIndex === i} 
                onChange={() => updateField('correctIndex', i)}
                style={{ width: 'auto' }}
              />
              Option {i + 1} {data.correctIndex === i && <span style={{ color: 'var(--accent-secondary)', fontSize: '0.7rem' }}>(Correct)</span>}
            </label>
            <input 
              value={option} 
              onChange={(e) => updateOption(i, e.target.value)} 
              placeholder={`Answer choice ${i + 1}`}
            />
          </div>
        ))}
      </div>

      <div className="input-group">
        <label>Explanation</label>
        <textarea 
          rows={3} 
          value={data.explanation} 
          onChange={(e) => updateField('explanation', e.target.value)}
          placeholder="Explain why this answer is correct..."
        />
      </div>
    </div>
  );
}
