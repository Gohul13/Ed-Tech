import { createContext, useContext } from 'react';

export const LearningContext = createContext(null);

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within LearningProvider');
  }
  return context;
};

