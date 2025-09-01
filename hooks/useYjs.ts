
import { useContext } from 'react';
import { YjsContext } from '../contexts/YjsContext';

export const useYjs = () => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYjs must be used within a YjsProvider');
  }
  return context;
};
