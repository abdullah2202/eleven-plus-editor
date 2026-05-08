import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Layout, Brain, Shapes, Code, Download, Plus, Eye, Edit3, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionType, VRQuestion, NVRQuestion } from './types';
import VREditor from './components/VREditor';
import NVREditor from './components/NVREditor';
import JSONPreview from './components/JSONPreview';
import ShapeEditor from './components/ShapeEditor';
import ShapeList from './components/ShapeList';

const DEFAULT_VR: VRQuestion = {
  id: uuidv4(),
  topic: 'analogies',
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
};

const DEFAULT_NVR: NVRQuestion = {
  id: uuidv4(),
  shapeType: 'sequence',
  svgOptions: [
    { svg: '', viewBox: '0 0 64 64' },
    { svg: '', viewBox: '0 0 64 64' },
    { svg: '', viewBox: '0 0 64 64' },
    { svg: '', viewBox: '0 0 64 64' },
  ],
  svgSequence: [
    { svg: '', viewBox: '0 0 64 64' },
    { svg: '', viewBox: '0 0 64 64' },
  ],
  correctIndex: 0,
  explanation: '',
};

type MainTab = 'question' | 'shape-edit' | 'shape-list';

function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('question');
  
  const [type, setType] = useState<QuestionType>('VR');
  const [vrData, setVrData] = useState<VRQuestion>(DEFAULT_VR);
  const [nvrData, setNvrData] = useState<NVRQuestion>(DEFAULT_NVR);

  const resetQuestion = () => {
    if (type === 'VR') setVrData({ ...DEFAULT_VR, id: uuidv4() });
    else setNvrData({ ...DEFAULT_NVR, id: uuidv4() });
  };

  const currentData = type === 'VR' ? vrData : nvrData;

  const renderQuestionEditor = () => (
    <div className="flex-col gap-4 animate-fade-in">
      <div className="glass p-1 flex gap-1" style={{ alignSelf: 'flex-start' }}>
        <button 
          className={type === 'VR' ? 'primary' : 'secondary'}
          onClick={() => setType('VR')}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
        >
          <Brain size={16} /> Verbal
        </button>
        <button 
          className={type === 'NVR' ? 'primary' : 'secondary'}
          onClick={() => setType('NVR')}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
        >
          <Shapes size={16} /> Non-Verbal
        </button>
      </div>

      <div className="grid-2">
        <section className="glass p-8 flex-col gap-4" style={{ minWidth: 0 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="flex items-center gap-2">
              <Layout size={20} className="text-accent-primary" />
              Editor
            </h2>
            <button className="secondary" onClick={resetQuestion} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <Plus size={14} /> New Question
            </button>
          </div>

          <AnimatePresence mode="wait">
            {type === 'VR' ? (
              <motion.div
                key="vr"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <VREditor data={vrData} onChange={setVrData} />
              </motion.div>
            ) : (
              <motion.div
                key="nvr"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <NVREditor data={nvrData} onChange={setNvrData} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="flex-col gap-4" style={{ minWidth: 0 }}>
          <div className="glass p-8 flex-col gap-4" style={{ flex: 1 }}>
            <h2 className="flex items-center gap-2 mb-4">
              <Code size={20} className="text-accent-primary" />
              JSON Output
            </h2>
            <JSONPreview data={currentData} />
          </div>
          
          <div className="glass p-8">
            <h2 className="flex items-center gap-2 mb-4">
              <Eye size={20} className="text-accent-primary" />
              Live Actions
            </h2>
            <div className="flex gap-2">
              <button 
                className="primary" 
                style={{ flex: 1 }}
                onClick={() => {
                  const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `question_${currentData.id}.json`;
                  a.click();
                }}
              >
                <Download size={18} /> Export Question
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="flex-col gap-4 animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1>Eleven Plus Editor</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create logic puzzles for your reasoning app</p>
        </div>
        
        <div className="glass p-1 flex gap-1">
          <button 
            className={activeTab === 'question' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('question')}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Brain size={18} /> Questions
          </button>
          <button 
            className={activeTab === 'shape-edit' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('shape-edit')}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Edit3 size={18} /> Shape Editor
          </button>
          <button 
            className={activeTab === 'shape-list' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('shape-list')}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Image size={18} /> Library
          </button>
        </div>
      </header>

      {activeTab === 'question' && renderQuestionEditor()}
      {activeTab === 'shape-edit' && <ShapeEditor />}
      {activeTab === 'shape-list' && <ShapeList />}
    </div>
  );
}

export default App;
