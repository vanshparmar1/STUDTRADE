import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, handleImageError } from '../utils/imageUrl';
import {
  getStudyMaterials,
  addStudyMaterial,
  filterStudyMaterials,
  getSubjectSuggestions,
  reportStudyMaterial,
} from '../utils/studyStore';

const BRANCHES = ['All Branches', 'CSE', 'IT', 'ECE', 'EE', 'Mechanical', 'Civil', 'Other'];
const YEARS = ['All Years', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const CONTENT_TYPES = [
  'All Types',
  'Notes',
  'PYQ',
  'Question Paper',
  'Assignment',
  'Practical',
  'Viva',
  'Important Questions',
  'Study Material',
  'Other',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp'];

export default function StudyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filter & Search State
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedType, setSelectedType] = useState('All Types');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Detail / Preview Modal
  const [reportModalItem, setReportModalItem] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    branch: 'CSE',
    year: '2nd Year',
    subject: '',
    contentType: 'Notes',
    title: '',
    description: '',
    semester: 'Semester 3',
    unit: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  // Materials State
  const [allMaterials, setAllMaterials] = useState([]);

  const fetchMaterials = async () => {
    try {
      const { data } = await API.get('/study');
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((item) => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          description: item.description,
          branch: item.branch,
          year: item.year,
          subject: item.subject,
          contentType: item.contentType,
          semester: item.semester,
          unit: item.unit,
          fileUrl: item.fileUrl,
          fileName: item.fileName,
          fileSize: item.fileSize,
          fileType: item.fileType,
          uploadedBy: item.uploadedByName || item.uploadedBy?.name || 'Student',
          uploadedByUserId: item.uploadedBy?._id || item.uploadedBy,
          uploadedAt: item.createdAt,
          viewsCount: item.viewsCount || 0,
          downloadsCount: item.downloadsCount || 0,
        }));
        setAllMaterials(mapped);
      }
    } catch (err) {
      console.warn('API study fetch note:', err.message);
      setAllMaterials([]);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchMaterials();
  }, []);

  // Filtered List (Realtime without page reload)
  const filteredMaterials = useMemo(() => {
    let list = [...allMaterials];

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => (
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.subject && item.subject.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      ));
    }

    if (selectedBranch && selectedBranch !== 'All Branches') {
      list = list.filter((item) => item.branch === selectedBranch || item.branch === 'All Branches');
    }

    if (selectedYear && selectedYear !== 'All Years') {
      list = list.filter((item) => item.year === selectedYear);
    }

    if (subjectFilter && subjectFilter.trim()) {
      const s = subjectFilter.toLowerCase().trim();
      list = list.filter((item) => item.subject && item.subject.toLowerCase().includes(s));
    }

    if (selectedType && selectedType !== 'All Types') {
      list = list.filter((item) => item.contentType === selectedType);
    }

    return list;
  }, [selectedBranch, selectedYear, subjectFilter, selectedType, searchQuery, allMaterials]);

  // Recently Uploaded (Latest 5 items)
  const recentUploads = useMemo(() => {
    return [...allMaterials]
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 5);
  }, [allMaterials]);

  // Subject Suggestions for Upload Form
  const subjectSuggestions = useMemo(() => getSubjectSuggestions(), [allMaterials]);

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSelectedBranch('All Branches');
    setSelectedYear('All Years');
    setSelectedType('All Types');
    setSubjectFilter('');
    setSearchQuery('');
  };

  // Quick Shortcut Click
  const handleQuickShortcut = (type) => {
    setSelectedType(type);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Handle File Change with Format & Size Validation
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`Unsupported file format (${ext}). Please upload PDF, DOC, PPT, or Image files.`);
      setSelectedFile(null);
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10 MB limit. Please select a smaller file.');
      setSelectedFile(null);
      return;
    }

    setFileError('');
    setSelectedFile(file);
  };

  // Upload Form Submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!uploadData.subject.trim() || !uploadData.title.trim()) {
      toast.error('Please enter Subject and Title for the study material.');
      return;
    }

    if (!selectedFile) {
      setFileError('Please select a document or file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadData.title.trim());
    formData.append('description', uploadData.description.trim());
    formData.append('branch', uploadData.branch);
    formData.append('year', uploadData.year);
    formData.append('subject', uploadData.subject.trim());
    formData.append('contentType', uploadData.contentType);
    formData.append('semester', uploadData.semester);
    formData.append('unit', uploadData.unit ? `Unit ${uploadData.unit}` : '');
    formData.append('files', selectedFile);

    try {
      const { data } = await API.post('/study', formData);
      if (data.success) {
        toast.success('Study material uploaded successfully! 📚🎉');
        fetchMaterials();
      }
    } catch (err) {
      console.error('API study post error:', err);
      const errMsg = err.response?.data?.message || 'Failed to upload study material. Please make sure you are logged in.';
      toast.error(errMsg);
    }

    setIsUploadModalOpen(false);

    // Reset Form
    setUploadData({
      branch: 'CSE',
      year: '2nd Year',
      subject: '',
      contentType: 'Notes',
      title: '',
      description: '',
      semester: 'Semester 3',
      unit: '',
    });
    setSelectedFile(null);
    setFileError('');
  };

  // Open Material Detail / Preview
  const handleViewMaterial = async (item) => {
    setSelectedItem(item);
    try {
      await API.post(`/study/${item._id || item.id}/view`);
    } catch (err) {
      // ignore
    }
  };

  // Download Material File
  const handleDownload = async (e, item) => {
    e.stopPropagation();
    toast.success(`Downloading "${item.fileName || item.title}"...`);
    try {
      await API.post(`/study/${item._id || item.id}/download`);
    } catch (err) {
      // ignore
    }

    const resolvedUrl = getImageUrl(item.fileUrl);
    const link = document.createElement('a');
    link.href = resolvedUrl;
    link.download = item.fileName || `${item.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Study Material (Owner or Admin)
  const handleDeleteMaterial = async (e, item) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      await API.delete(`/study/${item._id || item.id}`);
      toast.success('Study material deleted successfully!');
      setAllMaterials((prev) => prev.filter((m) => m.id !== item.id && m._id !== item.id));
      if (selectedItem && (selectedItem.id === item.id || selectedItem._id === item.id)) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Delete study material error:', err);
      toast.error('Failed to delete study material');
    }
  };

  // Report Submission
  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return toast.error('Please enter a reason for reporting');
    reportStudyMaterial(reportModalItem.id, reportReason);
    toast.success('Report submitted for moderation. Thank you for keeping campus study materials safe.');
    setReportModalItem(null);
    setReportReason('');
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'PYQ': return '📄';
      case 'Notes': return '📝';
      case 'Question Paper': return '❓';
      case 'Assignment': return '📌';
      case 'Practical': return '🧪';
      case 'Viva': return '🗣️';
      case 'Important Questions': return '⭐';
      default: return '📚';
    }
  };

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar activeLink="Study" />

      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">

        {/* ── 1. Header & Primary CTA ── */}
        <div className="bg-white rounded-3xl border border-[var(--color-outline-variant)]/30 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-3xl">📚</span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">STUDY</h1>
            </div>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Find and share study material with students from your branch.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="gradient-primary text-white px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-xl">upload_file</span>
            <span>+ Upload Study Material</span>
          </button>
        </div>

        {/* ── 2. Quick Access Branch & Type Shortcuts ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Quick Access Branches</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
              <button onClick={() => handleQuickShortcut('PYQ')} className="hover:underline cursor-pointer flex items-center gap-1">
                <span>📑 PYQs</span>
              </button>
              <span>•</span>
              <button onClick={() => handleQuickShortcut('Notes')} className="hover:underline cursor-pointer flex items-center gap-1">
                <span>📝 Notes</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {BRANCHES.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedBranch === b
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. Search & Filter Bar Controls ── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search Study Material (by subject, title or keyword)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-surface-container-low)] border border-slate-200/90 rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all"
            />
          </div>

          {/* Dynamic Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
            {/* Branch Filter */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-2.5 font-bold text-slate-700 focus:outline-none"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-2.5 font-bold text-slate-700 focus:outline-none"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Content Type Filter */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Content Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-2.5 font-bold text-slate-700 focus:outline-none"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Subject Filter Input */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Subject</label>
              <input
                type="text"
                placeholder="Subject name..."
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-700 focus:outline-none"
              />
            </div>

            {/* Clear Filters Button */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. Recently Uploaded Section ── */}
        {recentUploads.length > 0 && selectedBranch === 'All Branches' && selectedYear === 'All Years' && selectedType === 'All Types' && !searchQuery && !subjectFilter && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🆕</span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Recently Uploaded Material</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {recentUploads.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleViewMaterial(item)}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3.5 hover:border-[var(--color-primary)]/50 transition-all cursor-pointer space-y-2 text-left flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {getContentTypeIcon(item.contentType)} {item.contentType}
                      </span>
                      <span className="text-slate-400 font-semibold">{item.branch}</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug">{item.title}</h4>
                    <p className="text-[11px] font-semibold text-[var(--color-primary)] truncate">{item.subject}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                    <span className="font-bold text-slate-700">View &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. Main Content Feed ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Academic Resource Library</h2>
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredMaterials.length} {filteredMaterials.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {filteredMaterials.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="text-5xl">📚</div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">No study material found</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Try changing your branch, year, subject or content type filters to discover relevant study resources.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 rounded-xl gradient-primary text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Content Feed Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left relative group"
                >
                  {/* Card Top Meta */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-[11px] px-3 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                        <span>{getContentTypeIcon(item.contentType)}</span>
                        <span>{item.contentType}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-[var(--color-primary)] px-2.5 py-0.5 rounded-md bg-[var(--color-primary-container)]/20">
                          {item.branch} • {item.year}
                        </span>

                        {/* Delete Button for owner or admin */}
                        {(user?._id === item.uploadedByUserId || user?.role === 'admin') && (
                          <button
                            onClick={(e) => handleDeleteMaterial(e, item)}
                            title="Delete Study Material"
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-full"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        )}

                        {/* Report Options Menu */}
                        <button
                          onClick={() => setReportModalItem(item)}
                          title="Report Document"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-full"
                        >
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </div>
                    </div>

                    {/* Subject & Title */}
                    <div>
                      <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">{item.subject}</span>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-2 mt-0.5">
                        {item.title}
                      </h3>
                    </div>

                    {/* Description snippet */}
                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Meta & Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Uploaded by {item.uploadedBy || 'Student'}</span>
                      <span>📅 {new Date(item.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleViewMaterial(item)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                        <span>View</span>
                      </button>

                      <button
                        onClick={(e) => handleDownload(e, item)}
                        className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-bold text-xs shadow-2xs hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* ── 6. Upload Study Material Modal ── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">STUDENT ACADEMIC SHARING</span>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Study Material</h3>
                <p className="text-xs text-slate-500">Share verified notes, PYQs, and exam papers with fellow students.</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Banner */}
            {fileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{fileError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-semibold">
              {/* Branch & Year Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Branch *</label>
                  <select
                    value={uploadData.branch}
                    onChange={(e) => setUploadData({ ...uploadData, branch: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:outline-none"
                    required
                  >
                    {BRANCHES.filter((b) => b !== 'All Branches').map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Year *</label>
                  <select
                    value={uploadData.year}
                    onChange={(e) => setUploadData({ ...uploadData, year: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:outline-none"
                    required
                  >
                    {YEARS.filter((y) => y !== 'All Years').map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject (with Datalist Suggestions) & Content Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    list="subject-suggestions"
                    placeholder="Enter subject (e.g. DBMS, Operating Systems)"
                    value={uploadData.subject}
                    onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:outline-none"
                    required
                  />
                  <datalist id="subject-suggestions">
                    {subjectSuggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Content Type *</label>
                  <select
                    value={uploadData.contentType}
                    onChange={(e) => setUploadData({ ...uploadData, contentType: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:outline-none"
                    required
                  >
                    {CONTENT_TYPES.filter((t) => t !== 'All Types').map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Database Management Systems Unit 1-5 Complete Notes"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-slate-700 mb-1">Description (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Add details, topics covered, or exam hints..."
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-3 text-sm font-normal text-slate-800 focus:outline-none resize-none"
                />
              </div>

              {/* Semester & Unit (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Semester (optional)</label>
                  <select
                    value={uploadData.semester}
                    onChange={(e) => setUploadData({ ...uploadData, semester: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Unit / Chapter (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 1 &amp; 2 or All Units"
                    value={uploadData.unit}
                    onChange={(e) => setUploadData({ ...uploadData, unit: e.target.value })}
                    className="w-full bg-[var(--color-surface-container-low)] border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* File Upload Dropzone */}
              <div>
                <label className="block text-slate-700 mb-1">Upload Document / File *</label>
                <div className="border-2 border-dashed border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:border-[var(--color-primary)] transition-colors">
                  <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">cloud_upload</span>
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-800">
                      {selectedFile ? selectedFile.name : 'Click to select document'}
                    </span>
                    <p className="text-[10px] text-slate-400 font-normal">
                      PDF, DOC, DOCX, PPT, PPTX, JPG, PNG (Max 10 MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileSelect}
                    className="w-full text-xs font-semibold text-slate-500 cursor-pointer pt-1"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  Publish to Academic Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. Detail / Preview Modal ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-6 max-h-[92vh] overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {getContentTypeIcon(selectedItem.contentType)} {selectedItem.contentType}
                  </span>
                  <span className="text-[var(--color-primary)]">{selectedItem.branch} • {selectedItem.year}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{selectedItem.title}</h2>
                <p className="text-xs font-bold text-slate-500">Subject: {selectedItem.subject} {selectedItem.semester && `• ${selectedItem.semester}`}</p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* In-Browser Preview Section */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden min-h-[300px] max-h-[420px] flex items-center justify-center relative border border-slate-800">
              {selectedItem.fileUrl?.startsWith('data:application/pdf') || selectedItem.fileUrl?.toLowerCase().includes('.pdf') || selectedItem.fileType?.includes('pdf') ? (
                <iframe
                  src={getImageUrl(selectedItem.fileUrl)}
                  title={selectedItem.title}
                  className="w-full h-[380px] border-none"
                />
              ) : selectedItem.fileType?.startsWith('image/') || selectedItem.fileUrl?.match(/\.(jpg|jpeg|png|webp)$/i) || selectedItem.fileUrl?.startsWith('data:image/') ? (
                <img src={getImageUrl(selectedItem.fileUrl)} alt={selectedItem.title} onError={(e) => handleImageError(e)} className="max-h-[380px] w-full object-contain" />
              ) : (
                <div className="p-8 text-center text-white space-y-3">
                  <span className="material-symbols-outlined text-5xl text-blue-400">description</span>
                  <h4 className="font-extrabold text-base">{selectedItem.fileName || 'Academic Document'}</h4>
                  <p className="text-xs text-slate-300">Document preview ready for download.</p>
                </div>
              )}
            </div>

            {/* Description & Upload Metadata */}
            <div className="space-y-3 text-xs">
              {selectedItem.description && (
                <div>
                  <h4 className="font-extrabold uppercase text-slate-400 text-[10px] mb-1">Description</h4>
                  <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center font-semibold text-slate-700">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-extrabold">Uploaded By</span>
                  <span>{selectedItem.uploadedBy || 'Student'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-extrabold">Date</span>
                  <span>{new Date(selectedItem.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-extrabold">Views</span>
                  <span>👁️ {selectedItem.viewsCount || 0}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-extrabold">Downloads</span>
                  <span>📥 {selectedItem.downloadsCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href={getImageUrl(selectedItem.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all text-center"
              >
                View Full Window
              </a>

              <button
                onClick={(e) => handleDownload(e, selectedItem)}
                className="flex-1 py-3 rounded-2xl gradient-primary text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Report Moderation Modal ── */}
      {reportModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Report Study Material</h3>
              <button onClick={() => setReportModalItem(null)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-600">Report inaccurate, copyrighted, or inappropriate content for moderation.</p>
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Describe why this file should be removed..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}

      <StitchFooter />
    </div>
  );
}
