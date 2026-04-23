import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';

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
        'pickupAddress.fullAddress': user?.address?.fullAddress || '',
        'pickupAddress.city': user?.address?.city || '',
        'pickupAddress.pincode': user?.address?.pincode || '',
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
        setImages(images.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
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
            const response = await API.post('/items', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col">
            <StitchNavbar />

            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-grow w-full">
                {/* Header */}
                <header className="mb-16">
                    <h1 className="text-5xl font-extrabold tracking-tighter text-primary mb-4 leading-tight">List an Item</h1>
                    <p className="text-lg text-secondary font-medium max-w-2xl">
                        Give your pre-loved gear a new home. Reach thousands of students across campus instantly.
                    </p>
                </header>

                {/* Error */}
                {error && (
                    <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-semibold">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* ── Left Column: Form ── */}
                    <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-12">
                        {/* Image upload */}
                        <section>
                            <div className="flex justify-between items-end mb-6">
                                <h3 className="text-xl font-bold text-on-surface">Images (Max 5)</h3>
                                <span className="text-sm font-medium text-outline">{images.length} / 5 selected</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Add photo button */}
                                {images.length < 5 && (
                                    <label className="aspect-square bg-surface-container rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors group">
                                        <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">add_a_photo</span>
                                        <p className="mt-2 text-xs font-bold text-outline uppercase tracking-widest">Add Photo</p>
                                        <input type="file" className="hidden" onChange={handleFileChange} multiple accept="image/*" />
                                    </label>
                                )}
                                {/* Previews */}
                                {previews.map((src, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden relative group">
                                        <img src={src} alt="" className="w-full h-full object-cover object-center max-w-full overflow-hidden rounded-[inherit]" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 bg-white/90 p-1.5 text-error rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                ))}
                                {/* Empty placeholders */}
                                {Array.from({ length: Math.max(0, 3 - previews.length) }).map((_, i) => (
                                    <div key={`ph-${i}`} className="aspect-square bg-surface-container-low rounded-lg" />
                                ))}
                            </div>
                        </section>

                        {/* Listing details */}
                        <section className="bg-surface-container-lowest p-10 rounded-xl shadow-[0_40px_80px_rgba(0,102,103,0.03)] space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-primary mb-3 uppercase tracking-wider">Item Title</label>
                                    <input
                                        className="w-full bg-surface-container px-6 py-4 rounded-lg focus:ring-2 focus:ring-primary/20 border-none text-on-surface placeholder:text-outline/60"
                                        name="title"
                                        placeholder="e.g. Organic Chemistry Textbook (12th Edition)"
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-3 uppercase tracking-wider">Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-outline font-bold">₹</span>
                                        <input
                                            className="w-full bg-surface-container pl-12 pr-6 py-4 rounded-lg focus:ring-2 focus:ring-primary/20 border-none text-on-surface"
                                            name="price"
                                            placeholder="0"
                                            type="number"
                                            required
                                            value={formData.price}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-3 uppercase tracking-wider">Category</label>
                                    <select
                                        className="w-full bg-surface-container px-6 py-4 rounded-lg focus:ring-2 focus:ring-primary/20 border-none text-on-surface appearance-none cursor-pointer"
                                        name="category"
                                        required
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
                                <label className="block text-sm font-bold text-primary mb-4 uppercase tracking-wider">Item Condition</label>
                                <div className="flex flex-wrap gap-3">
                                    {CONDITIONS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, condition: c })}
                                            className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${
                                                formData.condition === c
                                                    ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/20'
                                                    : 'bg-surface-container text-outline hover:bg-surface-container-high'
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-primary mb-3 uppercase tracking-wider">Description</label>
                                <textarea
                                    className="w-full bg-surface-container px-6 py-4 rounded-lg focus:ring-2 focus:ring-primary/20 border-none text-on-surface placeholder:text-outline/60 resize-none"
                                    name="description"
                                    placeholder="Tell other students why they should buy this. Mention any wear and tear or special features."
                                    rows="5"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* ── Pickup Address Section ── */}
                        <section className="bg-surface-container-lowest p-10 rounded-xl shadow-[0_40px_80px_rgba(0,102,103,0.03)] space-y-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-primary text-[28px]">location_on</span>
                                <h3 className="text-xl font-bold text-on-surface tracking-tight">Pickup Location</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-primary mb-3 uppercase tracking-wider">Campus Address / Hostel Room</label>
                                    <input
                                        className="w-full bg-surface-container px-6 py-4 rounded-lg focus:ring-2 focus:ring-primary/20 border-none text-on-surface placeholder:text-outline/60"
                                        name="pickupAddress.fullAddress"
                                        placeholder="e.g. Hostel D, Room 214"
                                        type="text"
                                        required
                                        value={formData['pickupAddress.fullAddress']}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-3 uppercase tracking-wider">City</label>
                                    <input
                                        className="w-full bg-surface-container px-6 py-4 rounded-lg focus:ring-2 focus:ring-primary/20 border-none text-on-surface"
                                        name="pickupAddress.city"
                                        placeholder="City"
                                        type="text"
                                        required
                                        value={formData['pickupAddress.city']}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-3 uppercase tracking-wider">Pincode</label>
                                    <input
                                        className="w-full bg-surface-container px-6 py-4 rounded-lg focus:ring-2 focus:ring-primary/20 border-none text-on-surface"
                                        name="pickupAddress.pincode"
                                        placeholder="Pincode (e.g. 395007)"
                                        type="text"
                                        pattern="\d{6}"
                                        title="6-digit pincode"
                                        required
                                        value={formData['pickupAddress.pincode']}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Submit */}
                        <div className="pt-8">
                            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200/60 flex gap-3 text-amber-900 text-sm">
                                <span className="material-symbols-outlined shrink-0 text-amber-700">info</span>
                                <div>
                                    <p className="font-bold text-amber-900 mb-1">Important: Payment & Fees</p>
                                    <p className="text-amber-800/90 leading-relaxed">
                                        You will receive your money <strong>after the delivery</strong> is completed <span className="text-xs opacity-80">(the delivery will be arranged by us)</span>. Please note that a <strong>10% platform fee</strong> will be charged to the seller on the listed price.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-16 py-5 bg-primary-container text-on-primary-container font-extrabold text-lg rounded-full shadow-[0_20px_40px_rgba(26,128,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none"
                            >
                                {loading ? 'Posting...' : 'Post Listing'}
                            </button>
                        </div>
                    </form>

                    {/* ── Right Column: Sidebar ── */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Pro Tips */}
                        <div className="bg-surface-container p-8 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                            <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary-container">lightbulb</span>
                                Pro Tips for Sellers
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    { title: 'Take clear photos', desc: 'Natural lighting works best. Show the item from multiple angles.' },
                                    { title: 'Be honest', desc: 'Clearly mention any scratches or highlights to build trust.' },
                                    { title: 'Set a fair price', desc: 'Check similar listings to ensure your price is competitive.' },
                                ].map((tip, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-on-surface text-sm">{tip.title}</p>
                                            <p className="text-xs text-outline leading-relaxed mt-1">{tip.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>


                    </aside>
                </div>
            </main>

            <StitchFooter />
        </div>
    );
}
