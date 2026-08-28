import api from './api';

export const categoryService = {
  /**
   * Get all categories
   * @returns {Promise<Object>} Categories array
   */
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * Create a new category (Admin & Sales only)
   * @param {String} name
   * @returns {Promise<Object>} Created category
   */
  createCategory: async (name) => {
    const response = await api.post('/categories', { name });
    return response.data;
  },
};

export default categoryService;
