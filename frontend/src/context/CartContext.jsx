import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Fetch Cart from Backend (Only for Customer accounts)
  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'user') {
      setCart({ items: [] });
      return;
    }

    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      } else {
        setCart({ items: [] });
      }
    } catch (err) {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      return { success: false, message: 'Please log in as a customer to add items to cart.', requireAuth: true };
    }

    if (user.role !== 'user') {
      return {
        success: false,
        message: 'Shopping cart is available only for Customer accounts. Admin and Sales accounts manage store inventory.',
      };
    }

    try {
      const res = await cartService.addToCart(productId, quantity);
      if (res.success && res.data) {
        setCart(res.data);
        return { success: true, message: res.message || 'Product added to cart' };
      }
      return { success: false, message: res.message || 'Failed to add product to cart' };
    } catch (err) {
      const message = err.response?.data?.message || 'Error adding product to cart.';
      return { success: false, message };
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (productId, quantity) => {
    if (!user || user.role !== 'user') {
      return { success: false, message: 'Customer authentication required' };
    }

    try {
      const res = await cartService.updateCartQuantity(productId, quantity);
      if (res.success && res.data) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, message: res.message || 'Failed to update quantity' };
    } catch (err) {
      const message = err.response?.data?.message || 'Error updating quantity.';
      return { success: false, message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!user || user.role !== 'user') {
      return { success: false, message: 'Customer authentication required' };
    }

    try {
      const res = await cartService.removeFromCart(productId);
      if (res.success && res.data) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, message: res.message || 'Failed to remove product from cart' };
    } catch (err) {
      const message = err.response?.data?.message || 'Error removing item from cart.';
      return { success: false, message };
    }
  };

  // Total item count across all quantities
  const cartCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Cart grand subtotal
  const cartSubtotal = cart.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
