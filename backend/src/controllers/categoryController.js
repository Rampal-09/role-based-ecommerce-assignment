const Category = require('../models/Category');
const Product = require('../models/Product');

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Footwear',
  'Home',
  'Beauty',
  'Sports',
  'Apparel',
  'Misc',
];

/**
 * @desc    Get all categories (default + database + product categories)
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const dbCategories = await Category.find().sort({ name: 1 });
    const productCategories = await Product.distinct('category');

    const categorySet = new Set([
      ...DEFAULT_CATEGORIES,
      ...dbCategories.map((c) => c.name),
      ...productCategories.filter(Boolean),
    ]);

    const sortedCategories = Array.from(categorySet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    return res.status(200).json({
      success: true,
      count: sortedCategories.length,
      data: sortedCategories,
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving categories',
    });
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (Admin & Sales)
 */
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const trimmedName = name.trim();

    // Check if category already exists (case-insensitive)
    const existingCat = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existingCat) {
      return res.status(200).json({
        success: true,
        message: 'Category already exists',
        data: existingCat.name,
      });
    }

    const newCategory = new Category({
      name: trimmedName,
      createdBy: req.user.id,
    });

    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory.name,
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating category',
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
};
