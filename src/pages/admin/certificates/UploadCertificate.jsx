import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import certificateService from '../../../services/certificateService';
import studentService from '../../../services/studentService';
import DuplicateCertificateModal from '../../../components/certificates/DuplicateCertificateModal';
import CertificatePreviewModal from '../../../components/certificates/CertificatePreviewModal';
import AnimatedFileUpload from '../../../components/common/AnimatedFileUpload';
import StudentAvatar from '../../../components/common/StudentAvatar';
import {
  UploadCloud,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  User,
  ArrowRight,
  X
} from 'lucide-react';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const UploadCertificate = () => {
  usePageTitle('Upload Certificate');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const Layout = rawRole === 'FACULTY' ? FacultyLayout : AdminLayout;

  const [searchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId') || '';

  const [studentId, setStudentId] = useState(preselectedStudentId);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [duplicateModalData, setDuplicateModalData] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // If preselectedStudentId is given, load student details
  useEffect(() => {
    if (preselectedStudentId) {
      studentService.getStudentById(preselectedStudentId)
        .then((st) => {
          setSelectedStudent(st);
          setStudentId(st.studentId);
        })
        .catch(() => {
          setStudentId(preselectedStudentId);
        });
    }
  }, [preselectedStudentId]);

  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const types = await certificateService.getActiveDocumentTypes();
        setDocumentTypes(types || []);
        if (types && types.length > 0) setDocumentTypeId(types[0].id);
      } catch (err) {
        console.error('Failed to load document types:', err);
      }
    };
    fetchDocTypes();
  }, []);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setStudentId(student.studentId || student.id);
    setStudentSearchQuery('');
    setStudentOptions([]);
  };

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setStudentSearchQuery(val);
    if (!val || val.length < 2) {
      setStudentOptions([]);
      return;
    }
    try {
      const res = await studentService.searchStudents(val);
      setStudentOptions(res || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !documentTypeId || !selectedFile) {
      setError('Please select a student, document type, and choose a PDF file.');
      showWarning('Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('documentTypeId', documentTypeId);
    formData.append('file', selectedFile);

    if (documentNumber) formData.append('documentNumber', documentNumber);
    if (issueDate) formData.append('issueDate', issueDate);
    if (expiryDate) formData.append('expiryDate', expiryDate);
    if (issuedBy) formData.append('issuedBy', issuedBy);
    if (notes) formData.append('notes', notes);

    try {
      await certificateService.uploadCertificate(formData);
      showSuccess('Certificate uploaded successfully');
      setSelectedFile(null);
      setNotes('');
      setDocumentNumber('');
      setTimeout(() => {
        navigate('/admin/certificates');
      }, 1000);
    } catch (err) {
      if (err.response?.status === 409) {
        const dupData = err.response.data || {};
        setDuplicateModalData({
          existingCertificateId: dupData.documentId || dupData.existingCertificateId,
          certificateType: dupData.certificateType || 'Selected Certificate Type',
          studentId: dupData.studentId || studentId,
        });
        setError('Certificate already exists for this student.');
      } else {
        const msg = err.response?.data?.message || 'Failed to upload certificate.';
        setError(msg);
        showError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewExisting = async (existingCertId) => {
    try {
      const doc = await certificateService.getDocumentById(existingCertId);
      setPreviewDoc(doc);
    } catch (err) {
      showError('Failed to fetch existing certificate details');
    }
  };

  const handleReplaceExisting = async (existingCertId) => {
    if (!selectedFile) {
      showError('Please select a file to replace with.');
      return;
    }
    try {
      await certificateService.replaceCertificate(existingCertId, selectedFile);
      showSuccess('Certificate replaced successfully!');
      setDuplicateModalData(null);
      setTimeout(() => {
        navigate('/admin/certificates');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to replace certificate.';
      showError(msg);
      throw err;
    }
  };

  const handleDeleteExisting = async (existingCertId) => {
    try {
      await certificateService.deleteCertificate(existingCertId);
      showSuccess('Existing certificate deleted. You can now upload the new certificate.');
      setDuplicateModalData(null);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete existing certificate.';
      showError(msg);
      throw err;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        
        {/* Banner Card Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/20 inline-block">
              Certificate Upload Module
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Upload Student Certificate
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Attach and upload student PDF certificates to Supabase Private Storage with instant metadata indexing.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shrink-0">
            <UploadCloud className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Student Identification Section */}
            {selectedStudent ? (
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Target Student
                </label>
                <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <StudentAvatar
                      src={selectedStudent.profilePhotoUrl}
                      name={selectedStudent.fullName}
                      studentId={selectedStudent.studentId}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {selectedStudent.fullName}
                      </h4>
                      <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {selectedStudent.studentId} {selectedStudent.admissionNumber ? `• Adm: ${selectedStudent.admissionNumber}` : (selectedStudent.rollNumber ? `• Roll: ${selectedStudent.rollNumber}` : '')}
                      </p>
                    </div>
                  </div>
                  {!preselectedStudentId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(null);
                        setStudentId('');
                        setStudentSearchQuery('');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1 relative">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Search & Select Student *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Type Student ID, Full Name, or Admission No..."
                    value={studentSearchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                {/* Student Search Dropdown */}
                {studentOptions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-52 overflow-y-auto z-30 p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                    {studentOptions.map((st) => (
                      <button
                        key={st.id || st.studentId}
                        type="button"
                        onClick={() => handleStudentSelect(st)}
                        className="w-full text-left p-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-3 cursor-pointer transition"
                      >
                        <StudentAvatar src={st.profilePhotoUrl} name={st.fullName} studentId={st.studentId} size="xs" />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">{st.fullName}</span>
                          <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{st.studentId} • Adm: {st.admissionNumber || st.rollNumber || '—'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Certificate Type Selection */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Certificate Type *
              </label>
              <select
                value={documentTypeId}
                onChange={(e) => setDocumentTypeId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="">Select Certificate Type</option>
                {documentTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.name} ({dt.code}) - {dt.category || 'ACADEMIC'}
                  </option>
                ))}
              </select>
            </div>

            {/* File Input */}
            {/* Animated File Upload */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                Certificate PDF Document * (Max 5 MB)
              </label>
              <AnimatedFileUpload
                selectedFile={selectedFile}
                onFileSelect={(file) => {
                  if (file) {
                    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
                    const isPdfMime = file.type === 'application/pdf' || file.type === '';
                    if (!isPdfExt || !isPdfMime) {
                      setError('Only PDF files (.pdf) are allowed.');
                      setSelectedFile(null);
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      setError('PDF file size exceeds maximum 5 MB limit.');
                      setSelectedFile(null);
                      return;
                    }
                    setError('');
                    setSelectedFile(file);
                  }
                }}
                onFileRemove={() => setSelectedFile(null)}
                uploading={submitting}
                accept=".pdf,application/pdf"
                maxSizeMB={5}
                label="Drag & drop PDF certificates or any document"
                sublabel="or browse files on your computer"
              />
            </div>

            {/* Optional Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Reference No. (optional)
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g. SSC-2026-9901"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Issuing Authority / Board (optional)
                </label>
                <input
                  type="text"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  placeholder="e.g. Board of Secondary Education"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Internal Remarks / Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add verification remarks..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/admin/certificates')}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/30 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 min-h-[44px]"
              >
                <span>{submitting ? 'Uploading PDF...' : 'Upload Certificate PDF'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Duplicate Certificate Action Modal */}
      {duplicateModalData && (
        <DuplicateCertificateModal
          duplicateData={duplicateModalData}
          onView={handleViewExisting}
          onReplace={handleReplaceExisting}
          onDelete={handleDeleteExisting}
          onCancel={() => setDuplicateModalData(null)}
        />
      )}

      {/* Certificate Preview Modal */}
      {previewDoc && (
        <CertificatePreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </Layout>
  );
};

export default UploadCertificate;
