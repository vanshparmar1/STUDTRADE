import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Books', 'Cycles', 'Tech', 'Furniture', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function ItemListing() {
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: '',
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            return setError('You can only upload up to 5 images');
        }

        setError('');
        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setImages(newImages);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0) return setError('At least one image is required');

        setLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        images.forEach(image => data.append('images', image));

        try {
            const response = await axios.post('http://localhost:5000/api/items', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    if (user?.verificationStatus !== 'approved') {
        return (
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center max-w-lg">
                    <div className="text-5xl mb-6">🔒</div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4">Verification Required</h2>
                    <p className="text-gray-600 font-medium mb-8">
                        You need to be a verified student to list items on STUDTRADE.
                        {user?.verificationStatus === 'pending'
                            ? " Your verification is currently under review."
                            : " Please complete your KYC verification first."}
                    </p>
                    {user?.verificationStatus !== 'pending' && (
                        <button
                            onClick={() => navigate('/kyc')}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                        >
                            Verify Now
                        </button>
                    )}
                </div>
            </main>
        );
    }

    return (
        <main className="flex-grow bg-gray-50/50 p-6 flex items-start justify-center pb-24">
            <div className="w-full max-w-4xl grid lg:grid-cols-5 gap-10">

                {/* Header Information */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">List an Item</h1>
                        <p className="text-lg text-gray-500 font-medium mt-3">Reach thousands of students on campus. Fast, safe, and easy.</p>
                    </div>

                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 hidden lg:block">
                        <h3 className="text-xl font-bold mb-4">Pro Tips for Sellers</h3>
                        <ul className="space-y-4 opacity-90 font-medium">
                            <li className="flex gap-3 text-sm">
                                <span className="bg-white/20 px-2 py-1 rounded h-fit leading-none mt-0.5">1</span>
                                Take clear photos in natural light.
                            </li>
                            <li className="flex gap-3 text-sm">
                                <span className="bg-white/20 px-2 py-1 rounded h-fit leading-none mt-0.5">2</span>
                                Be honest about the item's condition.
                            </li>
                            <li className="flex gap-3 text-sm">
                                <span className="bg-white/20 px-2 py-1 rounded h-fit leading-none mt-0.5">3</span>
                                Set a fair price to sell faster.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 ml-1 uppercase tracking-wider">Item Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                placeholder="e.g. Hero Cycle - Good Condition"
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-semibold text-gray-900"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Price & Category Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-2 ml-1 uppercase tracking-wider">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    placeholder="0"
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-semibold text-gray-900"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-2 ml-1 uppercase tracking-wider">Category</label>
                                <select
                                    name="category"
                                    required
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-semibold text-gray-900 appearance-none cursor-pointer"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-wider">Item Condition</label>
                            <div className="flex flex-wrap gap-3">
                                {CONDITIONS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, condition: c })}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${formData.condition === c
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                                                : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-200'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 ml-1 uppercase tracking-wider">Description</label>
                            <textarea
                                name="description"
                                required
                                rows="4"
                                placeholder="Describe your item in detail (original price, usage, defects if any)..."
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-gray-900 resize-none"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 ml-1 uppercase tracking-wider">Images (Max 5)</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {previews.map((src, i) => (
                                    <div key={i} className="aspect-square relative group rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 bg-white/90 p-1 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-indigo-300 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        <span className="text-[10px] font-black uppercase">Add</span>
                                        <input type="file" className="hidden" onChange={handleFileChange} multiple accept="image/*" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Posting Item...' : 'Post Listing'}
                    </button>
                </form>
            </div>
        </main>
    );
}
