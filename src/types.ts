export type VRTopic = 'analogies' | 'odd_one_out' | 'synonyms' | 'antonyms' | 'number_sequence' | 'letter_sequence';

export type VRQuestion = {
  id: string;
  topic: VRTopic;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export type NVRShapeType = 'sequence' | 'odd_one_out';

export type SVGItem = {
  svg: string;
  viewBox: string;
};

export type NVRQuestion = {
  id: string;
  shapeType: NVRShapeType;
  svgOptions: [SVGItem, SVGItem, SVGItem, SVGItem];
  svgSequence?: SVGItem[];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export type QuestionType = 'VR' | 'NVR';
