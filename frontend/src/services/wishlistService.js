import api from './api';

export const wishlistService = {
  /**
   * Fetch authenticated user's wishlist
   * @returns {Promise<Object>} Wishlist data
   */
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  /**
   * Add a product to wishlist
   * @param {String} productId
   * @returns {Promise<Object>} Updated wishlist data
   */
  addToWishlist: async (productId) => {
    const response = await api.post(`/wishlist/${productId}`);
    return response.data;
  },

  /**
   * Remove a product from wishlist
   * @param {String} productId
   * @returns {Promise<Object>} Updated wishlist data
   */
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },
};

export default wishlistService;
