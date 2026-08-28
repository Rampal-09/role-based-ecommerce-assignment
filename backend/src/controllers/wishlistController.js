const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * @desc    Get authenticated user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving wishlist',
    });
  }
};

/**
 * @desc    Add product to authenticated user's wishlist (no duplicate entries)
 * @route   POST /api/wishlist/:productId
 * @access  Private
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Verify product exists in DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: [productId],
      });
      await wishlist.save();
    } else {
      // Check if product is already in wishlist
      const isAlreadyInWishlist = wishlist.products.some(
        (p) => p.toString() === productId
      );

      if (!isAlreadyInWishlist) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    const populatedWishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: populatedWishlist,
    });
  } catch (error) {
    console.error('Add To Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding product to wishlist',
    });
  }
};

/**
 * @desc    Remove product from authenticated user's wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        data: { products: [] },
      });
    }

    // Filter out productId
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );

    await wishlist.save();

    const populatedWishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: populatedWishlist,
    });
  } catch (error) {
    console.error('Remove From Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing product from wishlist',
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
