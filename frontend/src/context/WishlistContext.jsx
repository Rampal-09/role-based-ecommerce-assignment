import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  // Fetch Wishlist from Backend (Only for Customer accounts)
  const fetchWishlist = useCallback(async () => {
    if (!user || user.role !== 'user') {
      setWishlist({ products: [] });
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistService.getWishlist();
      if (res.success && res.data) {
        setWishlist(res.data);
      } else {
        setWishlist({ products: [] });
      }
    } catch (err) {
      setWishlist({ products: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Add item to Wishlist
  const addToWishlist = async (productId) => {
    if (!user) {
      return { success: false, message: 'Please log in as a customer to save items to your wishlist.', requireAuth: true };
    }

    if (user.role !== 'user') {
      return {
        success: false,
        message: 'Wishlist is available only for Customer accounts. Admin and Sales accounts manage store inventory.',
      };
    }

    try {
      const res = await wishlistService.addToWishlist(productId);
      if (res.success && res.data) {
        setWishlist(res.data);
        return { success: true, message: res.message || 'Product added to wishlist' };
      }
      return { success: false, message: res.message || 'Failed to add to wishlist' };
    } catch (err) {
      const message = err.response?.data?.message || 'Error updating wishlist.';
      return { success: false, message };
    }
  };

  // Remove item from Wishlist
  const removeFromWishlist = async (productId) => {
    if (!user || user.role !== 'user') {
      return { success: false, message: 'Customer authentication required' };
    }

    try {
      const res = await wishlistService.removeFromWishlist(productId);
      if (res.success && res.data) {
        setWishlist(res.data);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Error removing from wishlist.';
      return { success: false, message };
    }
  };

  // Helper to check if a product is already in the wishlist
  const isInWishlist = (productId) => {
    if (!wishlist.products || !productId) return false;
    return wishlist.products.some((p) => {
      const id = typeof p === 'object' ? p._id : p;
      return id === productId;
    });
  };

  // Wishlist Count: UNIQUE PRODUCTS count
  const wishlistCount = wishlist.products ? wishlist.products.length : 0;

  const value = {
    wishlist,
    wishlistCount,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
