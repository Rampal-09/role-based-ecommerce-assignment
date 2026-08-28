const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get authenticated user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Get Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving cart',
    });
  }
};

/**
 * @desc    Add product to authenticated user's cart (merges quantity if existing, validates stock)
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Product ID is required',
      });
    }

    const requestedQty = parseInt(quantity, 10);
    if (isNaN(requestedQty) || requestedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    // Verify product exists and check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently out of stock',
      });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      if (requestedQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock} available)`,
        });
      }

      cart = new Cart({
        user: req.user.id,
        items: [{ product: productId, quantity: requestedQty }],
      });
      await cart.save();
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Product already in cart: validate merged quantity against stock
        const newTotalQty = cart.items[itemIndex].quantity + requestedQty;

        if (newTotalQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Requested quantity exceeds available stock (${product.stock} available)`,
          });
        }

        cart.items[itemIndex].quantity = newTotalQty;
      } else {
        // New item in cart
        if (requestedQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Requested quantity exceeds available stock (${product.stock} available)`,
          });
        }

        cart.items.push({ product: productId, quantity: requestedQty });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      data: populatedCart,
    });
  } catch (error) {
    console.error('Add To Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding product to cart',
    });
  }
};

/**
 * @desc    Update product quantity in cart (validated against stock)
 * @route   PATCH /api/cart/:productId
 * @access  Private
 */
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer greater than or equal to 1',
      });
    }

    // Verify product and available stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (newQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock} available)`,
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    cart.items[itemIndex].quantity = newQty;
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      data: populatedCart,
    });
  } catch (error) {
    console.error('Update Cart Quantity Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart quantity',
    });
  }
};

/**
 * @desc    Remove product from authenticated user's cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Product removed from cart',
        data: { items: [] },
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      data: populatedCart,
    });
  } catch (error) {
    console.error('Remove From Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing product from cart',
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
};
