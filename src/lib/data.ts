import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder | undefined => PlaceHolderImages.find(img => img.id === id);

export const diseases = [
  {
    slug: 'influenza',
    name: 'Influenza (Flu)',
    shortDescription: 'A contagious respiratory illness caused by influenza viruses.',
    image: getImage('flu'),
    details: {
      symptoms: 'Fever, cough, sore throat, muscle aches, headaches, and fatigue.',
      causes: 'Caused by influenza viruses that infect the nose, throat, and lungs.',
      controlMeasures: 'Annual vaccination, frequent hand washing, and avoiding contact with sick individuals.',
      types: 'Influenza A, B, and C.',
      examples: 'Seasonal flu, Swine flu (H1N1).',
      emergency: 'Difficulty breathing, chest pain, confusion, severe vomiting.',
      whenToContactDoctor: 'If you have severe symptoms or are in a high-risk group (e.g., young children, elderly, pregnant women, or people with chronic health conditions).',
    },
  },
  {
    slug: 'diabetes-mellitus',
    name: 'Diabetes Mellitus',
    shortDescription: 'A group of diseases that result in too much sugar in the blood.',
    image: getImage('diabetes'),
    details: {
      symptoms: 'Increased thirst, frequent urination, extreme hunger, unexplained weight loss, fatigue, and blurred vision.',
      causes: 'A lack of insulin or the body\'s inability to use insulin efficiently.',
      controlMeasures: 'Healthy diet, regular exercise, blood sugar monitoring, and medication (insulin or oral drugs).',
      types: 'Type 1, Type 2, and Gestational Diabetes.',
      examples: 'Managing blood sugar levels through diet and insulin injections.',
      emergency: 'Diabetic ketoacidosis (DKA), very high or low blood sugar levels.',
      whenToContactDoctor: 'For initial diagnosis, regular check-ups, and managing complications.',
    },
  },
  {
    slug: 'hypertension',
    name: 'Hypertension',
    shortDescription: 'A condition in which the force of the blood against the artery walls is too high.',
    image: getImage('hypertension'),
    details: {
      symptoms: 'Often has no symptoms. If symptoms occur, they can include headaches, shortness of breath, or nosebleeds.',
      causes: 'Genetics, high-salt diet, obesity, lack of physical activity, and smoking.',
      controlMeasures: 'Lifestyle changes (diet, exercise), and medication such as diuretics or ACE inhibitors.',
      types: 'Primary (essential) hypertension and Secondary hypertension.',
      examples: 'Monitoring blood pressure at home and taking prescribed medication.',
      emergency: 'Blood pressure of 180/120 mm Hg or higher, accompanied by chest pain, shortness of breath, or signs of stroke.',
      whenToContactDoctor: 'For regular blood pressure checks and to manage the condition with a healthcare provider.',
    },
  },
  {
    slug: 'asthma',
    name: 'Asthma',
    shortDescription: 'A chronic disease that affects your airways, causing wheezing and coughing.',
    image: getImage('asthma'),
    details: {
      symptoms: 'Shortness of breath, chest tightness, wheezing when exhaling, and coughing.',
      causes: 'A combination of genetic and environmental factors. Triggers include allergens, respiratory infections, and physical activity.',
      controlMeasures: 'Avoiding triggers, using long-term control medications, and carrying a quick-relief inhaler.',
      types: 'Allergic, Non-allergic, Exercise-induced, Occupational.',
      examples: 'Using an albuterol inhaler during an asthma attack.',
      emergency: 'Severe and constant wheezing, coughing, or shortness of breath that does not improve with a rescue inhaler.',
      whenToContactDoctor: 'To get a diagnosis, create an asthma action plan, and for regular follow-ups to adjust treatment.',
    },
  },
];

export type Disease = typeof diseases[0];
