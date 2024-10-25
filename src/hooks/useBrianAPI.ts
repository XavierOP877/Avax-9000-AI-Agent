import { useState } from 'react';
import axios from 'axios';

export const useBrianAPI = () => {
  const [loading, setLoading] = useState(false);

  const processPrompt = async (prompt: string) => {
    setLoading(true);
    try {
      console.log('Sending prompt to API:', prompt);
      
      const response = await axios.post('/api/prompt', { prompt });
      console.log('API Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to process prompt'
      );
    } finally {
      setLoading(false);
    }
  };

  return { processPrompt, loading };
};