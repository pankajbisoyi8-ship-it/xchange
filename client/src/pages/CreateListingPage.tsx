import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { Category, Condition } from '../types/index.ts';
import { 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  DollarSign, 
  Info,
  ShieldAlert
} from 'lucide-react';

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState<Condition>('GOOD');
  const [ageMonths, setAgeMonths] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<Record<string, any>>({});
  const [images, setImages] = useState<string[]>([]);

  // State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/listings/categories');
        const list = res.data.data || [];
        setCategories(list);
        if (list.length > 0) {
          setSelectedCategory(list[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  const handleCategoryChange = (catId: string) => {
    const cat = categories.find(c => c.id === catId) || null;
    setSelectedCategory(cat);
    setSpecs({}); // reset category specs
  };

  const handleSpecChange = (fieldName: string, value: any) => {
    setSpecs(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      setError('You can upload a maximum of 8 photos.');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        const res = await api.post('/listings/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setImages(prev => [...prev, res.data.data.url]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setError('');

    if (images.length === 0) {
      setError('Please upload at least 1 photo of your hardware.');
      return;
    }

    if (!price || Number(price) < 100) {
      setError('Please set a valid price (minimum ₹100).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        categoryId: selectedCategory.id,
        title,
        brand,
        model,
        condition,
        ageMonths: ageMonths ? Number(ageMonths) : undefined,
        price: Number(price),
        area,
        description,
        specs,
        images
      };

      await api.post('/listings', payload);
      navigate('/orders'); // redirect to user listings/orders
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  // Commission Calculations (PRD ORD-5: Platform commission is calculated and shown to seller before listing)
  const itemPriceNum = Number(price) || 0;
  const platformCommission = Math.round(itemPriceNum * 0.05); // 5%
  const estimatedPayout = itemPriceNum - platformCommission;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Sell Used PC & Laptop Hardware
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Every listing is reviewed by admins and bench-tested by a field agent before delivery.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Category & Basics */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>Category & Basic Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Component Category *</label>
              <select
                value={selectedCategory?.id || ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Manufacturer *</label>
              <input
                type="text"
                placeholder="e.g. ASUS, MSI, AMD, Corsair"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model / Part Number *</label>
              <input
                type="text"
                placeholder="e.g. GeForce RTX 3070 Gaming OC 8G"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Listing Headline / Title *</label>
              <input
                type="text"
                placeholder="e.g. ZOTAC RTX 3070 Twin Edge 8GB - Never Mined, Box Included"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dynamic Category Specs */}
        {selectedCategory && selectedCategory.specSchema?.fields && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">2</span>
              <span>Technical Specifications ({selectedCategory.name})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCategory.specSchema.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'boolean' ? (
                    <select
                      value={specs[field.name] ? 'true' : 'false'}
                      onChange={(e) => handleSpecChange(field.name, e.target.value === 'true')}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      value={specs[field.name] || ''}
                      onChange={(e) => handleSpecChange(
                        field.name,
                        field.type === 'number' ? Number(e.target.value) : e.target.value
                      )}
                      required={field.required}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-brand-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Condition, Location & Pricing */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>Condition, Location & Pricing</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Condition Grade *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-brand-500"
              >
                <option value="LIKE_NEW">Like New (Immaculate, minimal use)</option>
                <option value="GOOD">Good (Light wear, fully functional)</option>
                <option value="FAIR">Fair (Visible cosmetic wear, works 100%)</option>
                <option value="FOR_PARTS">For Parts (Defective / repair needed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age in Months (Approx)</label>
              <input
                type="number"
                placeholder="e.g. 14"
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Area / City *</label>
              <input
                type="text"
                placeholder="e.g. South Delhi, Gurgaon Sec 45"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Pricing & Platform Commission Ledger Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Listing Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 24000"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full max-w-xs px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Buyer Pays:</span>
                <span className="font-bold text-slate-800 text-sm">₹{itemPriceNum.toLocaleString()} (+ ₹200 Del.)</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Platform Fee (5%):</span>
                <span className="font-bold text-slate-800 text-sm">₹{platformCommission.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900">
                <span className="text-emerald-700 block font-medium">Your Direct Net Payout:</span>
                <span className="font-bold text-emerald-700 text-base">₹{estimatedPayout.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description & Usage History *</label>
            <textarea
              rows={4}
              placeholder="Describe physical condition, overclocking history, thermal performance, accessories included (original box, anti-static bag, cables)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Section 4: Hardware Photos */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">4</span>
              <span>Hardware Photos (1 to 8 Images)</span>
            </h2>
            <span className="text-xs text-slate-400">{images.length}/8 uploaded</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {images.length < 8 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/50 flex flex-col items-center justify-center cursor-pointer transition-colors p-4 text-center">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-600">Upload Photo</span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG, WebP</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="sr-only"
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="px-8 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 disabled:opacity-50 transition-all"
          >
            {submitting ? 'Submitting for Admin Review...' : 'Submit Listing for Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

