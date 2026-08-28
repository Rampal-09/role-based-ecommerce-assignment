import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { Edit3, Upload, AlertCircle, ArrowLeft, CheckCircle, Image as ImageIcon, Loader2, Plus } from 'lucide-react';

const EditProductPage = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [categoriesList, setCategoriesList] = useState([
    'Electronics',
    'Fashion',
    'Footwear',
    'Home',
    'Beauty',
    'Sports',
    'Apparel',
    'Misc',
  ]);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // New Category Creation state
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catCreating, setCatCreating] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getProductById(id),
          categoryService.getCategories(),
        ]);

        if (catRes.success && Array.isArray(catRes.data)) {
          setCategoriesList(catRes.data);
        }

        if (prodRes.success && prodRes.data) {
          const p = prodRes.data;
          setProduct(p);
          setName(p.name || '');
          setDescription(p.description || '');
          setPrice(p.price !== undefined ? p.price : '');
          setCategory(p.category || 'Electronics');
          setStock(p.stock !== undefined ? p.stock : '');
          setCurrentImage(p.image || '');

          const ownerId = typeof p.owner === 'object' ? p.owner?._id : p.owner;
          const currentUserId = user?._id || user?.id;
          const isOwner = ownerId && currentUserId && ownerId.toString() === currentUserId.toString();

          if (!isAdmin && !isOwner) {
            setErrorMsg('Access Denied: You can only edit products that you own.');
          }
        } else {
          setErrorMsg(prodRes.message || 'Product not found');
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndCategories();
  }, [id, user, isAdmin]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCatCreating(true);
    setErrorMsg('');
    try {
      const res = await categoryService.createCategory(newCatName.trim());
      if (res.success && res.data) {
        const createdCat = res.data;
        if (!categoriesList.includes(createdCat)) {
          setCategoriesList((prev) => [...prev, createdCat]);
        }
        setCategory(createdCat);
        setNewCatName('');
        setShowNewCatInput(false);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error creating category.');
    } finally {
      setCatCreating(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size exceeds maximum limit of 5MB.');
        return;
      }
      setNewImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || price === '' || !category || stock === '') {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const parsedPrice = Number(price);
    const parsedStock = parseInt(stock, 10);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMsg('Please provide a valid price (>= 0).');
      return;
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      setErrorMsg('Please provide a valid stock count (>= 0).');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('price', parsedPrice);
      formData.append('category', category);
      formData.append('stock', parsedStock);

      if (newImageFile) {
        formData.append('image', newImageFile);
      }

      const response = await productService.updateProduct(id, formData);

      if (response.success) {
        setSuccessMsg('Product updated successfully!');
        setTimeout(() => {
          navigate(`/products/${id}`);
        }, 1200);
      } else {
        setErrorMsg(response.message || 'Failed to update product.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error updating product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-semibold font-display text-slate-600">Loading product editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <Link
        to={`/products/${id}`}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Product Details</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 mb-3">
            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Product Management & Editing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Edit Product
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Updating specifications for <span className="font-semibold text-slate-800">{product?.name}</span>
          </p>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-2 text-xs sm:text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center space-x-2 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Product Image (Upload new to replace)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-indigo-400 transition-colors bg-slate-50">
              <div className="space-y-2 text-center">
                {imagePreview || currentImage ? (
                  <div className="relative mx-auto w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-3">
                    <img
                      src={imagePreview || currentImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex text-xs text-slate-600 justify-center">
                  <label
                    htmlFor="edit-file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>{imagePreview ? 'Change new image' : 'Upload new image file'}</span>
                    <input
                      id="edit-file-upload"
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  Leave unchanged to keep current image
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Category with Inline Creation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCatInput(!showNewCatInput)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showNewCatInput ? 'Select Existing' : '+ New Category'}</span>
                </button>
              </div>

              {showNewCatInput ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Enter new category..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-indigo-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={catCreating || !newCatName.trim()}
                    className="px-3.5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {catCreating ? 'Adding...' : 'Add'}
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2499"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Product Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of features..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Submit button */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <Link
              to={`/products/${id}`}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
