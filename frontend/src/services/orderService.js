import api from './api';

export const orderService = {
  /**
   * Fetch authenticated customer's personal order history
   * @returns {Promise<Object>} Orders list
   */
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  /**
   * Fetch Sales Person dashboard data (seller metrics, filtered orders, products)
   * @returns {Promise<Object>} Seller stats, orders, and products
   */
  getSellerDashboard: async () => {
    const response = await api.get('/orders/seller-dashboard');
    return response.data;
  },

  /**
   * Fetch Admin dashboard data (store-wide metrics, all orders)
   * @returns {Promise<Object>} Store statistics and all orders
   */
  getAdminDashboard: async () => {
    const response = await api.get('/orders/admin-dashboard');
    return response.data;
  },

  /**
   * Fetch registered users list for Admin
   * @returns {Promise<Object>} Users list
   */
  getAdminUsers: async () => {
    const response = await api.get('/orders/admin/users');
    return response.data;
  },

  /**
   * Update user role (Admin only)
   * @param {string} userId - User ID to update
   * @param {string} role - New role ('user', 'sales', 'admin')
   * @returns {Promise<Object>} Updated user response
   */
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/orders/admin/users/${userId}/role`, { role });
    return response.data;
  },
};

export default orderService;
