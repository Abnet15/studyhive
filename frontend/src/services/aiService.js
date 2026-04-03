import { apiClient } from './apiClient';

const aiService = {
  /**
   * Get personalized recommendations for the student
   */
  getRecommendations: (token) => {
    return apiClient.get('/ai/recommendations', { token });
  },

  /**
   * Explain a specific course or material
   * @param {Object} data - { courseId, materialId }
   */
  explain: (data, token) => {
    return apiClient.post('/ai/explain', data, { token });
  },

  /**
   * Generate a quiz for a topic
   * @param {Object} data - { topic, difficulty }
   */
  generateQuiz: (data, token) => {
    return apiClient.post('/ai/generate-quiz', data, { token });
  },

  /**
   * Analyze an uploaded file
   * @param {File} file 
   */
  analyzeFile: (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/ai/analyze-file', formData, { token });
  },

  /**
   * Chat with the AI tutor
   */
  chat: (message, context, token) => {
    return apiClient.post('/ai/chat', { message, context }, { token });
  }
};

export default aiService;
