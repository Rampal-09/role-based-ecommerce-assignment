const mongoose = require('mongoose');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

/**
 * @desc    Get all products (supports search, category, minPrice, maxPrice)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;

    const query = {};

    // Keyword Search (searches name and description)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    // Category Filter
    if (category && category.trim()) {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Price Range Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        const parsedMin = Number(minPrice);
        if (!isNaN(parsedMin)) query.price.$gte = parsedMin;
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const parsedMax = Number(maxPrice);
        if (!isNaN(parsedMax)) query.price.$lte = parsedMax;
      }
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    const products = await Product.find(query)
      .populate('owner', 'name email _id')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving products',
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = await Product.findById(id).populate('owner', 'name email _id');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving product',
    });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Admin, Sales)
 */
const createProduct = async (req, res) => {
  let uploadedCloudinaryAsset = null;

  try {
    const { name, description, price, category, stock } = req.body;

    // Field Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required',
      });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price (>= 0) is required',
      });
    }

    if (stock === undefined || stock === null || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock count (>= 0) is required',
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product category is required',
      });
    }

    // Image Validation (Multer file or pre-provided URL)
    let imageUrl = '';
    let imagePublicId = '';

    if (req.file) {
      uploadedCloudinaryAsset = await uploadToCloudinary(req.file.buffer, 'products', req.file.mimetype);
      imageUrl = uploadedCloudinaryAsset.url;
      imagePublicId = uploadedCloudinaryAsset.public_id;
    } else if (req.body.image && req.body.image.trim()) {
      imageUrl = req.body.image.trim();
      imagePublicId = req.body.imagePublicId || '';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Product image is required',
      });
    }

    // Build Product: Strictly force owner = req.user.id (ignoring any req.body.owner)
    const product = await Product.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      category: category.trim(),
      stock: parseInt(stock, 10),
      image: imageUrl,
      imagePublicId,
      owner: req.user.id, // Enforce authenticated user as owner
    });

    const populatedProduct = await Product.findById(product._id).populate('owner', 'name email _id');

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    // Cleanup Cloudinary image if database save fails
    if (uploadedCloudinaryAsset?.public_id) {
      await deleteFromCloudinary(uploadedCloudinaryAsset.public_id).catch(() => {});
    }

    console.error('Create Product Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating product',
    });
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private (Admin can update any product, Sales can update ONLY own product)
 */
const updateProduct = async (req, res) => {
  let newUploadedAsset = null;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Product Ownership Check:
    // Admin: Can manage any product.
    // Sales Person: Can manage ONLY their own products.
    if (req.user.role === 'sales' && product.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage your own products',
      });
    }

    const { name, description, price, category, stock } = req.body;

    // Field updates with validation
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Product name cannot be empty',
        });
      }
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid number greater than or equal to 0',
        });
      }
      product.price = parsedPrice;
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be empty',
        });
      }
      product.category = category.trim();
    }

    if (stock !== undefined) {
      const parsedStock = parseInt(stock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be an integer greater than or equal to 0',
        });
      }
      product.stock = parsedStock;
    }

    // Handle New Image Upload
    if (req.file) {
      newUploadedAsset = await uploadToCloudinary(req.file.buffer, 'products', req.file.mimetype);

      // Delete old image from Cloudinary if existing
      if (product.imagePublicId) {
        await deleteFromCloudinary(product.imagePublicId).catch(() => {});
      }

      product.image = newUploadedAsset.url;
      product.imagePublicId = newUploadedAsset.public_id;
    } else if (req.body.image && req.body.image.trim()) {
      product.image = req.body.image.trim();
      if (req.body.imagePublicId !== undefined) {
        product.imagePublicId = req.body.imagePublicId;
      }
    }

    // Save updated product (owner remains strictly untouched)
    await product.save();

    const updatedProduct = await Product.findById(product._id).populate('owner', 'name email _id');

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    if (newUploadedAsset?.public_id) {
      await deleteFromCloudinary(newUploadedAsset.public_id).catch(() => {});
    }

    console.error('Update Product Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating product',
    });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin can delete any product, Sales can delete ONLY own product)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Product Ownership Check:
    // Admin: Can delete any product.
    // Sales Person: Can delete ONLY their own products.
    if (req.user.role === 'sales' && product.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage your own products',
      });
    }

    // Delete image from Cloudinary if public_id exists
    if (product.imagePublicId) {
      await deleteFromCloudinary(product.imagePublicId).catch(() => {});
    }

    // Delete product document from DB
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting product',
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
