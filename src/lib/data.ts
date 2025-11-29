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
      types: 'Influenza A, B, C',
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
      types: 'Type 1, Type 2, Gestational',
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
      types: 'Primary (essential), Secondary',
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
      types: 'Allergic, Non-allergic, Exercise-induced, Occupational',
      examples: 'Using an albuterol inhaler during an asthma attack.',
      emergency: 'Severe and constant wheezing, coughing, or shortness of breath that does not improve with a rescue inhaler.',
      whenToContactDoctor: 'To get a diagnosis, create an asthma action plan, and for regular follow-ups to adjust treatment.',
    },
  },
  {
    slug: 'migraine',
    name: 'Migraine',
    shortDescription: 'A type of headache that can cause severe throbbing pain or a pulsing sensation.',
    image: getImage('migraine'),
    details: {
      symptoms: 'Severe, often one-sided, throbbing headache, sensitivity to light, sound, and smells, nausea, and vomiting.',
      causes: 'Exact causes are unknown, but genetics and environmental factors appear to play a role. Triggers can include stress, hormonal changes, and certain foods.',
      controlMeasures: 'Identifying and avoiding triggers, over-the-counter pain relievers, prescription medications (triptans), and lifestyle adjustments.',
      types: 'Migraine with aura, Migraine without aura',
      examples: 'Taking sumatriptan at the onset of a migraine attack.',
      emergency: 'A sudden, severe "thunderclap" headache, or a headache with fever, stiff neck, confusion, seizure, or double vision.',
      whenToContactDoctor: 'If headaches are frequent, severe, or change in pattern.',
    },
  },
  {
    slug: 'gastroesophageal-reflux-disease',
    name: 'GERD',
    shortDescription: 'A digestive disorder that affects the ring of muscle between your esophagus and stomach.',
    image: getImage('gerd'),
    details: {
      symptoms: 'A burning sensation in your chest (heartburn), chest pain, difficulty swallowing, and regurgitation of food or sour liquid.',
      causes: 'Frequent acid reflux, where stomach acid flows back into the tube connecting your mouth and stomach (esophagus).',
      controlMeasures: 'Dietary changes (avoiding fatty, spicy, or acidic foods), lifestyle modifications (e.g., not lying down after eating), and medications like antacids or proton pump inhibitors (PPIs).',
      types: 'Symptomatic GERD, Erosive esophagitis',
      examples: 'Taking omeprazole to reduce stomach acid production.',
      emergency: 'Severe chest pain (to rule out a heart attack), difficulty swallowing, or signs of bleeding.',
      whenToContactDoctor: 'If you experience symptoms more than twice a week or if over-the-counter medications are not providing relief.',
    },
  },
  {
    slug: 'anxiety-disorder',
    name: 'Anxiety Disorder',
    shortDescription: 'A group of mental illnesses characterized by significant feelings of anxiety and fear.',
    image: getImage('anxiety'),
    details: {
      symptoms: 'Excessive worrying, feeling agitated, restlessness, fatigue, difficulty concentrating, irritability, and trouble sleeping.',
      causes: 'A complex mix of genetic, environmental, and psychological factors. Stressful life events can trigger symptoms.',
      controlMeasures: 'Psychotherapy (like CBT), medication (such as SSRIs), stress management techniques, and regular exercise.',
      types: 'Generalized Anxiety Disorder (GAD), Panic Disorder, Social Anxiety Disorder',
      examples: 'Practicing mindfulness meditation to manage feelings of worry.',
      emergency: 'If you are having suicidal thoughts or are unable to control your worry and it significantly impacts your daily life.',
      whenToContactDoctor: 'If anxiety is interfering with your work, relationships, or other parts of your life.',
    },
  },
  {
    slug: 'allergic-rhinitis',
    name: 'Allergic Rhinitis',
    shortDescription: 'An allergic reaction that causes sneezing, congestion, and an itchy nose.',
    image: getImage('allergies'),
    details: {
      symptoms: 'Sneezing, runny or stuffy nose, itchy or watery eyes, and itching of the nose, mouth or throat.',
      causes: 'An allergic response to airborne allergens, such as pollen, dust mites, or pet dander.',
      controlMeasures: 'Avoiding allergens, over-the-counter or prescription antihistamines, nasal corticosteroid sprays, and allergy shots (immunotherapy).',
      types: 'Seasonal (Hay Fever), Perennial',
      examples: 'Taking loratadine (Claritin) during pollen season.',
      emergency: 'Anaphylaxis, a severe allergic reaction causing difficulty breathing, swelling of the throat, and a rapid pulse.',
      whenToContactDoctor: 'If symptoms are severe, persistent, or not relieved by over-the-counter treatments.',
    },
  },
];

export type Disease = typeof diseases[0];
