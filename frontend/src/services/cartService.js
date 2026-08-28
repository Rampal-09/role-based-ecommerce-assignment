import api from './api';

export const cartService = {
  /**
   * Fetch authenticated user's cart
   * @returns {Promise<Object>} Cart data
   */
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  /**
   * Add a product to cart with quantity
   * @param {String} productId
   * @param {Number} quantity
   * @returns {Promise<Object>} Updated cart data
   */
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },

  /**
   * Update quantity of an item in cart
   * @param {String} productId
   * @param {Number} quantity
   * @returns {Promise<Object>} Updated cart data
   */
  updateQuantity: async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    return response.data;
  },

  /**
   * Remove item from cart
   * @param {String} productId
   * @returns {Promise<Object>} Updated cart data
   */
  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },
};

export default cartService;
