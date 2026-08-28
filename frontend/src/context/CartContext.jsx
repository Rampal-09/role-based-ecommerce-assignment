import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Fetch Cart from Backend
  const fetchCart = useCallback(async () => {
    if (!user) {
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
      return { success: false, message: 'Please log in to add items to your cart.', requireAuth: true };
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
    if (!user) return { success: false, message: 'Authentication required' };

    try {
      const res = await cartService.updateQuantity(productId, quantity);
      if (res.success && res.data) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Error updating quantity.';
      return { success: false, message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!user) return { success: false, message: 'Authentication required' };

    try {
      const res = await cartService.removeFromCart(productId);
      if (res.success && res.data) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Error removing item from cart.';
      return { success: false, message };
    }
  };

  // Calculate Cart Count: TOTAL QUANTITY (e.g. Shoes×2 + Watch×1 + Bag×3 = 6)
  const cartCount = cart.items ? cart.items.reduce((total, item) => total + (item.quantity || 0), 0) : 0;

  // Calculate Cart Subtotal: sum(product.price * quantity)
  const cartSubtotal = cart.items
    ? cart.items.reduce((total, item) => {
        const price = item.product?.price || 0;
        return total + price * (item.quantity || 0);
      }, 0)
    : 0;

  const value = {
    cart,
    cartCount,
    cartSubtotal,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
