import api from './api';

export const paymentService = {
  /**
   * Create Razorpay Order from current user's active cart
   * @returns {Promise<Object>} Order data containing orderId, amount, currency, keyId
   */
  createOrder: async () => {
    const response = await api.post('/payment/create-order');
    return response.data;
  },

  /**
   * Verify Razorpay payment signature
   * @param {Object} paymentData - { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   * @returns {Promise<Object>} Created order data
   */
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payment/verify-payment', paymentData);
    return response.data;
  },
};

export default paymentService;
