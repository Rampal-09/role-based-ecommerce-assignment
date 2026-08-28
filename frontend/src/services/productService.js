import api from './api';

/**
 * Product API Service
 */
export const productService = {
  /**
   * Fetch products with optional query parameters (search, category, minPrice, maxPrice)
   * @param {Object} params - Query filters
   * @returns {Promise<Object>} API response data
   */
  getProducts: async (params = {}) => {
    const cleanParams = {};
    if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
    if (params.category && params.category !== 'All') cleanParams.category = params.category;
    if (params.minPrice !== undefined && params.minPrice !== '') cleanParams.minPrice = params.minPrice;
    if (params.maxPrice !== undefined && params.maxPrice !== '') cleanParams.maxPrice = params.maxPrice;

    const response = await api.get('/products', { params: cleanParams });
    return response.data;
  },

  /**
   * Fetch single product details by ID
   * @param {String} id - Product ID
   * @returns {Promise<Object>} API response data
   */
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product (Admin and Sales only)
   * @param {FormData} formData - Multipart form data containing fields and image file
   * @returns {Promise<Object>} API response data
   */
  createProduct: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update an existing product (Admin or Product Owner)
   * @param {String} id - Product ID
   * @param {FormData} formData - Multipart form data
   * @returns {Promise<Object>} API response data
   */
  updateProduct: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a product (Admin or Product Owner)
   * @param {String} id - Product ID
   * @returns {Promise<Object>} API response data
   */
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
