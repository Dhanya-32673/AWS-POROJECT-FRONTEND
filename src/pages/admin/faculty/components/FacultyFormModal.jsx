import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Mail, Phone, Briefcase, GraduationCap, Calendar, 
  Lock, AlertCircle, Camera, Upload, RotateCcw, MapPin, Building, Hash 
} from 'lucide-react';

const DEPARTMENTS = [
  'Mathematics & Sciences',
  'Physics',
  'Chemistry',
  'Botany & Zoology',
  'Commerce & Management',
  'Economics',
  'Computer Science',
  'Languages & Humanities'
];

const DESIGNATIONS = [
  'Lecturer',
  'Senior Lecturer',
  'Head of Department (HOD)',
  'Assistant Professor',
  'Senior Faculty',
  'Visiting Lecturer'
];

const GROUPS = ['MPC', 'BiPC', 'MEC', 'CEC'];
const EMPLOYMENT_TYPES = ['PERMANENT', 'CONTRACT', 'VISITING'];

export const FacultyFormModal = ({ isOpen, onClose, onSave, editingFaculty = null }) => {
  const isEdit = Boolean(editingFaculty);

  const initialForm = {
    facultyId: '',
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '',
    email: '',
    mobileNumber: '',
    alternateMobile: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    designation: 'Lecturer',
    department: 'Mathematics & Sciences',
    primaryGroup: 'MPC',
    qualification: 'M.Sc',
    employmentType: 'PERMANENT',
    experience: '3 Years',
    joiningDate: new Date().toISOString().split('T')[0],
    password: '',
    status: 'ACTIVE'
  };

  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    if (editingFaculty) {
      setFormData({
        facultyId: editingFaculty.facultyId || '',
        employeeId: editingFaculty.employeeId || '',
        firstName: editingFaculty.firstName || '',
        middleName: editingFaculty.middleName || '',
        lastName: editingFaculty.lastName || '',
        gender: editingFaculty.gender || 'MALE',
        dateOfBirth: editingFaculty.dateOfBirth ? String(editingFaculty.dateOfBirth).split('T')[0] : '',
        email: editingFaculty.email || '',
        mobileNumber: editingFaculty.mobileNumber || '',
        alternateMobile: editingFaculty.alternateMobile || '',
        address: editingFaculty.address || '',
        city: editingFaculty.city || '',
        district: editingFaculty.district || '',
        state: editingFaculty.state || '',
        pinCode: editingFaculty.pinCode || '',
        designation: editingFaculty.designation || 'Lecturer',
        department: editingFaculty.department || 'Mathematics & Sciences',
        primaryGroup: editingFaculty.primaryGroup || 'MPC',
        qualification: editingFaculty.qualification || 'M.Sc',
        employmentType: editingFaculty.employmentType || 'PERMANENT',
        experience: editingFaculty.experience || '',
        joiningDate: editingFaculty.joiningDate ? String(editingFaculty.joiningDate).split('T')[0] : '',
        password: '',
        status: editingFaculty.status || 'ACTIVE'
      });
      setPhotoPreview(editingFaculty.photoUrl || null);
    } else {
      setFormData({
        ...initialForm,
        password: 'Faculty@' + Math.floor(1000 + Math.random() * 9000)
      });
      setPhotoPreview(null);
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPhotoFile(null);
    setPhotoError('');
    setErrors({});
    setApiError('');
  }, [editingFaculty, isOpen]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError('Only JPG, PNG, or WEBP images are supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file size must be less than 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPhotoError('');
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPhotoPreview(url);
    setPhotoFile(file);
  };

  const handleRevertPhoto = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPhotoFile(null);
    setPhotoError('');
    setPhotoPreview(editingFaculty?.photoUrl || null);
  };

  const validate = () => {
    const newErrors = {};
    if (formData.facultyId && formData.facultyId.trim()) {
      if (!/^\d{4}$/.test(formData.facultyId.trim())) {
        newErrors.facultyId = 'Faculty ID must be exactly 4 digits (e.g. 1001 - 9999)';
      }
    }
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address format';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }
    if (formData.alternateMobile && !/^\d{10}$/.test(formData.alternateMobile.replace(/\D/g, ''))) {
      newErrors.alternateMobile = 'Alternate mobile must be 10 digits';
    }
    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode.replace(/\D/g, ''))) {
      newErrors.pinCode = 'PIN Code must be 6 digits';
    }
    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'Login password is required';
    }
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError('');

    try {
      const payload = { ...formData };
      if (payload.facultyId) payload.facultyId = payload.facultyId.trim();
      if (!payload.dateOfBirth) payload.dateOfBirth = null;
      if (!payload.joiningDate) payload.joiningDate = null;
      if (payload.alternateMobile) payload.alternateMobile = payload.alternateMobile.trim();
      if (payload.employeeId) payload.employeeId = payload.employeeId.trim();
      if (payload.address) payload.address = payload.address.trim();
      if (payload.city) payload.city = payload.city.trim();
      if (payload.district) payload.district = payload.district.trim();
      if (payload.state) payload.state = payload.state.trim();
      if (payload.pinCode) payload.pinCode = payload.pinCode.trim();

      await onSave(payload, editingFaculty?.id, photoFile);
      onClose();
    } catch (err) {
      console.error('Failed to save faculty:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save faculty record';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto max-h-[calc(100vh-2.5rem)] sm:max-h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/70 dark:bg-blue-950/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEdit ? 'Edit Faculty Profile' : 'Add New Faculty Member'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit ? `Updating profile details for ${editingFaculty.fullName}` : 'Register a new teaching staff profile and account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 min-h-0">
          {apiError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Profile Picture Upload Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-blue-100/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-white dark:bg-slate-700 border-2 border-blue-500/30 shadow-md flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Faculty Preview"
                    className="w-full h-full object-cover"
                    onError={() => setPhotoPreview(null)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-blue-600 text-white font-black text-2xl">
                    {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : <User className="w-8 h-8 opacity-80" />}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Faculty Profile Photo
                </h4>
                {photoFile && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-md">
                    New photo selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Upload a formal passport-sized photograph. PNG, JPG or WEBP up to 5MB.
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2.5 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 rounded-xl transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {photoFile && (
                  <button
                    type="button"
                    onClick={handleRevertPhoto}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {photoError && (
                <p className="text-[11px] text-rose-500 font-medium mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{photoError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5" />
              <span>1. Personal Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 ${
                    errors.firstName ? 'border-rose-400 ring-rose-400/20' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20'
                  }`}
                />
                {errors.firstName && <span className="text-[11px] text-rose-500 mt-1 block">{errors.firstName}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rao"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 ${
                    errors.lastName ? 'border-rose-400 ring-rose-400/20' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20'
                  }`}
                />
                {errors.lastName && <span className="text-[11px] text-rose-500 mt-1 block">{errors.lastName}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty ID (4 Digits) {isEdit ? '' : '(Auto-assigned if blank)'}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder={isEdit ? "e.g. 2555" : "e.g. 1001"}
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  className={`w-full px-3 py-2 text-sm font-mono rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 ${
                    errors.facultyId ? 'border-rose-400 ring-rose-400/20' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20'
                  }`}
                />
                {errors.facultyId ? (
                  <span className="text-[11px] text-rose-500 mt-1 block">{errors.facultyId}</span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-0.5 block">4-digit numeric identifier (e.g. 1001 - 9999)</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Employee Code / Biometric ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2555 (Optional)"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Optional institutional staff reference</span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>2. Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  disabled={isEdit}
                  placeholder="faculty@bhashyam.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 ${
                    isEdit ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : ''
                  } ${errors.email ? 'border-rose-400 ring-rose-400/20' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20'}`}
                />
                {errors.email && <span className="text-[11px] text-rose-500 mt-1 block">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 ${
                    errors.mobileNumber ? 'border-rose-400 ring-rose-400/20' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20'
                  }`}
                />
                {errors.mobileNumber && <span className="text-[11px] text-rose-500 mt-1 block">{errors.mobileNumber}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alternate Mobile
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Optional 10 digits"
                  value={formData.alternateMobile}
                  onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 ${
                    errors.alternateMobile ? 'border-rose-400 ring-rose-400/20' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20'
                  }`}
                />
                {errors.alternateMobile && <span className="text-[11px] text-rose-500 mt-1 block">{errors.alternateMobile}</span>}
              </div>
            </div>
          </div>

          {/* Section 3: Residential & Address Details */}
          <div>
            <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>3. Residential Address Details</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Flat/Door No., Street name, Landmark, Colony"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vijayawada"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Krishna"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Andhra Pradesh"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 520010"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 ${
                      errors.pinCode ? 'border-rose-400 ring-rose-400/20' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20'
                    }`}
                  />
                  {errors.pinCode && <span className="text-[11px] text-rose-500 mt-1 block">{errors.pinCode}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Professional & Academic Role */}
          <div>
            <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>4. Professional & Department Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Designation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  {DESIGNATIONS.map((desig) => (
                    <option key={desig} value={desig}>{desig}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Stream / Group
                </label>
                <select
                  value={formData.primaryGroup}
                  onChange={(e) => setFormData({ ...formData, primaryGroup: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  placeholder="e.g. M.Sc (Mathematics), B.Ed"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Employment Type
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Experience
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 Years"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Login Account Setup (Only when Creating) */}
          {!isEdit && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Faculty Login Account</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                A faculty portal user account will be created automatically with these credentials.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 font-mono focus:outline-hidden focus:ring-2 ${
                    errors.password ? 'border-rose-400 ring-rose-400/20' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20'
                  }`}
                />
                {errors.password && <span className="text-[11px] text-rose-500 mt-1 block">{errors.password}</span>}
              </div>
            </div>
          )}

          {/* Section 6: Status (If Editing) */}
          {isEdit && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Faculty Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEdit ? 'Save Changes' : 'Create Faculty'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default FacultyFormModal;
