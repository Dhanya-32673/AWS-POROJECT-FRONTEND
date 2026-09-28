import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useDataRefresh } from '../../../utils/dataSync';
import { formatSectionName, formatBranchGroup, formatIntermediateYear } from '../../../utils/studentDataFormatter';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import StudentAvatar from '../../../components/common/StudentAvatar';
import StudentStatusBadge from '../../../components/students/StudentStatusBadge';
import CertificateStatusBadge from '../../../components/certificates/CertificateStatusBadge';
import CertificatePreviewModal from '../../../components/certificates/CertificatePreviewModal';
import UploadCertificateModal from '../../../components/certificates/UploadCertificateModal';
import studentService from '../../../services/studentService';
import certificateService from '../../../services/certificateService';
import DeleteStudentModal from '../../../components/students/DeleteStudentModal';
import {
  CreditCard,
  Edit3,
  Trash2,
  User,
  Phone,
  Users,
  BookOpen,
  Award,
  Upload,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronLeft,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Heart,
  DollarSign,
  School,
  Bus,
  Home,
  Check,
  X,
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [student, setStudent] = useState(null);
  usePageTitle(student?.fullName ? `${student.fullName} - Student Profile` : 'Student Profile');
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PERSONAL');
  
  // Sensitive Data Toggles
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [showPan, setShowPan] = useState(false);

  // Modals & Document Actions
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [studentData, docsData, typesData] = await Promise.all([
        studentService.getStudentById(id),
        certificateService.getStudentDocuments(id),
        certificateService.getActiveDocumentTypes()
      ]);
      setStudent(studentData);
      setDocuments(docsData || []);
      setDocumentTypes(typesData || []);
    } catch (err) {
      console.error('Failed to load student profile:', err);
      setError('Student profile not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);
  useDataRefresh(['students', 'certificates', 'sections'], fetchProfileData);

  const { showSuccess, showError } = useToast();
  const [docToDelete, setDocToDelete] = useState(null);

  const handleDeleteConfirm = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await studentService.deleteStudent(student.studentId || id);
      showSuccess('Student and login account deleted successfully');
      navigate('/admin/students');
    } catch (err) {
      setError('Failed to delete student record.');
      showError('Failed to delete student record.');
    } finally {
      setDeleting(false);
    }
  };

  // Document Verification / Rejection / Deletion / Download handlers
  const handleVerifyDocument = async (docId) => {
    setActionLoadingId(docId);
    try {
      await certificateService.verifyDocument(docId);
      showSuccess('Certificate verified successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to verify document.';
      showError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectDocument = async (docId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason || !reason.trim()) return;
    setActionLoadingId(docId);
    try {
      await certificateService.rejectDocument(docId, reason);
      showSuccess('Certificate rejected');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject document.';
      showError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteDocumentConfirmed = async () => {
    if (!docToDelete) return;
    const docId = docToDelete.id;
    setActionLoadingId(docId);
    try {
      await certificateService.deleteDocument(docId);
      showSuccess('Document deleted successfully');
      setDocToDelete(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete document.';
      showError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const fileUrl = doc.storagePath || doc.fileUrl || `/api/documents/${doc.id}/file`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = doc.originalFileName || `${doc.documentTypeName || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      showError('Failed to download file.');
    }
  };

  // Helper formatter to satisfy "Zero N/A Policy"
  const formatVal = (val, suffix = '') => {
    if (val !== null && val !== undefined && String(val).trim() !== '' && String(val).toUpperCase() !== 'N/A') {
      return `${val}${suffix}`;
    }
    return <span className="text-slate-400 font-medium italic">Not Provided</span>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-24 text-center font-sans space-y-3">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent shadow-md" />
          <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Loading full student profile data...</p>
        </div>
      </Layout>
    );
  }

  if (error || !student) {
    return (
      <Layout>
        <div className="py-16 text-center text-slate-500 font-sans space-y-4">
          <p className="text-base font-bold text-slate-800 dark:text-white">{error || 'Student not found.'}</p>
          <button
            onClick={() => navigate('/admin/students')}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
          >
            Back to Students Directory
          </button>
        </div>
      </Layout>
    );
  }

  // Calculate missing documents
  const uploadedDocTypeIds = new Set(documents.map((d) => d.documentTypeId || d.documentType?.id));
  const missingDocumentTypes = documentTypes.filter((dt) => dt.requiredByDefault && !uploadedDocTypeIds.has(dt.id));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/students')}
            className="text-xs font-extrabold text-slate-500 hover:text-blue-600 flex items-center space-x-1.5 cursor-pointer transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Students Directory</span>
          </button>
        </div>

        {/* Enterprise Profile Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <div className="relative group shrink-0">
              <StudentAvatar
                src={student.profilePhotoUrl}
                name={student.fullName}
                studentId={student.studentId}
                size="2xl"
                rounded="rounded-2xl"
                className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white/30 shadow-2xl shrink-0"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" title="Active Record" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start space-x-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {student.fullName}
                </h1>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white font-mono text-xs font-black rounded-lg border border-white/30">
                  {student.studentId}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-blue-100 font-medium">
                <span>Adm No: <strong className="text-white font-bold font-mono">{formatVal(student.admissionNumber)}</strong></span>
                <span>Group: <strong className="text-white font-bold">{formatBranchGroup(student.branchGroup)}</strong></span>
                <span>Year: <strong className="text-white font-bold">{formatIntermediateYear(student.intermediateYear)}</strong></span>
                <span>Batch: <strong className="text-white font-bold">{formatVal(student.batch)}</strong></span>
                <span>Campus: <strong className="text-white font-bold">{student.campus || 'Unassigned'}</strong></span>
                <span>Type: <strong className="text-white font-bold">{student.hostelDayScholar === 'HOSTEL' ? 'Hostel' : 'Day Scholar'}</strong></span>
              </div>

              <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
                <StudentStatusBadge status={student.status} />
                <span className="px-2.5 py-0.5 bg-white/10 text-white rounded-md text-[11px] font-extrabold border border-white/20">
                  {documents.length} Certificates Uploaded
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => navigate(`/admin/students/${student.studentId}/id-card`)}
              className="w-full sm:w-auto py-2.5 px-4 text-xs font-extrabold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px]"
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Generate ID Card</span>
            </button>

            {isAdmin && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => navigate(`/admin/students/${id}/edit`)}
                  className="flex-1 sm:flex-none py-2.5 px-4 text-xs font-extrabold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer backdrop-blur-md min-h-[44px]"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2.5 text-white/90 hover:text-white bg-rose-500/30 hover:bg-rose-500/50 border border-white/20 rounded-xl transition cursor-pointer backdrop-blur-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Delete Student Record"
                  aria-label="Delete Student Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Responsive Navigation Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1.5 text-xs font-extrabold overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          {[
            { id: 'PERSONAL', label: 'A. Basic Information', icon: User },
            { id: 'CONTACT', label: 'B. Contact Information', icon: Phone },
            { id: 'FAMILY', label: 'C. Family Information', icon: Users },
            { id: 'ACADEMIC', label: 'D. Academic Information', icon: BookOpen },
            { id: 'CERTIFICATES', label: `E. Certificates (${documents.length})`, icon: Award },
            { id: 'ACCOUNT', label: 'F. Account & Security', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 sm:px-5 rounded-t-2xl border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 min-h-[44px] whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Tab Details Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl text-xs space-y-6 animate-fadeIn">
          
          {/* TAB A: BASIC INFORMATION */}
          {activeTab === 'PERSONAL' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Basic Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Student ID</span>
                  <p className="font-mono font-extrabold text-blue-600 dark:text-blue-400">{formatVal(student.studentId)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Admission Number</span>
                  <p className="font-mono font-extrabold text-slate-900 dark:text-white">{formatVal(student.admissionNumber)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Full Name</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.fullName)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Gender</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.gender)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Date of Birth</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.dateOfBirth)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Nationality</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.nationality || 'Indian')}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Religion</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.religion)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Category</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.category || student.casteCategory)}</p>
                </div>

                {/* Aadhaar Number with Eye Toggle */}
                <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/40 flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 block">
                      Aadhaar Number
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {showAadhaar
                        ? (student.aadhaarNumber || student.maskedAadhaar || 'Not Provided')
                        : (student.maskedAadhaar || (student.aadhaarNumber ? `•••• •••• ${student.aadhaarNumber.slice(-4)}` : '•••• •••• ••••'))}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAadhaar(!showAadhaar)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition cursor-pointer"
                      title={showAadhaar ? "Mask Aadhaar" : "Show Full Aadhaar"}
                    >
                      {showAadhaar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB B: CONTACT INFORMATION */}
          {activeTab === 'CONTACT' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Mobile Number *</span>
                  <p className="font-mono font-extrabold text-slate-900 dark:text-white">{formatVal(student.mobileNumber)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Alternate Mobile</span>
                  <p className="font-mono font-extrabold text-slate-900 dark:text-white">{formatVal(student.alternateMobile)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Email Address - 1 *</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{formatVal(student.emailAddress1 || student.email)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Email Address - 2 *</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{formatVal(student.emailAddress2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB C: FAMILY INFORMATION */}
          {activeTab === 'FAMILY' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  3. Family Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Father Name *</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.fatherName)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Mother Name *</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.motherName)}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB D: ACADEMIC INFORMATION */}
          {activeTab === 'ACADEMIC' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  4. Academic Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Academic Year *</span>
                  <p className="font-extrabold text-blue-600 dark:text-blue-400">{formatVal(student.academicYear)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Branch / Group *</span>
                  <p className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">{formatVal(student.branchGroup)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Intermediate Year *</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.intermediateYear)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Batch *</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.batch)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Admission Type</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(student.admissionType)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Hostel / Day Scholar *</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{student.hostelDayScholar === 'HOSTEL' ? 'Hostel' : 'Day Scholar'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Campus Assignment *</span>
                  <p className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">{student.campus || 'Unassigned'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Status</span>
                  <div className="pt-0.5">
                    <StudentStatusBadge status={student.status} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB E: CERTIFICATES & DOCUMENTS */}
          {activeTab === 'CERTIFICATES' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>Uploaded PDF Documents ({documents.length})</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  View, download, verify, replace, or manage attached PDF certificates.
                </p>
              </div>

              {/* Uploaded Documents List Grid */}
              {documents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No certificates uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-blue-300 transition"
                    >
                      <div className="flex items-start space-x-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {doc.documentTypeName}
                            </span>
                            <CertificateStatusBadge status={doc.status} />
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-extrabold">
                              {doc.category || 'ACADEMIC'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-slate-500 font-medium">
                            <span>Doc No: <strong className="text-slate-800 dark:text-slate-200">{formatVal(doc.documentNumber)}</strong></span>
                            <span>Upload Date: <strong>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}</strong></span>
                            <span>Verified By: <strong>{doc.verifiedBy || 'Pending Verification'}</strong></span>
                            <span>Last Updated: <strong>{doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : '-'}</strong></span>
                          </div>

                          {doc.rejectionReason && (
                            <p className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 mt-1">
                              Rejection Reason: {doc.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-700 w-full md:w-auto">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px]"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View PDF</span>
                        </button>

                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px]"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDocTypeId(doc.documentTypeId || doc.documentType?.id);
                            setUploadModalOpen(true);
                          }}
                          className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px]"
                          title="Replace Document"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Replace</span>
                        </button>

                        {/* Admin / Faculty Verification Controls */}
                        {doc.status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyDocument(doc.id)}
                            disabled={actionLoadingId === doc.id}
                            className="flex-1 sm:flex-none px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 min-h-[44px]"
                          >
                            <Check className="w-4 h-4" />
                            <span>Verify</span>
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => setDocToDelete(doc)}
                            disabled={actionLoadingId === doc.id}
                            className="p-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 dark:border-rose-800 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Delete Document (Admin Only)"
                            aria-label="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB F: ACCOUNT INFORMATION */}
          {activeTab === 'ACCOUNT' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Account & System Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Username</span>
                  <p className="font-mono font-extrabold text-blue-600 dark:text-blue-400">{formatVal(student.studentId)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Registered Email</span>
                  <p className="font-bold text-slate-900 dark:text-white">{formatVal(student.email)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">User Role</span>
                  <p className="font-extrabold text-blue-600 dark:text-blue-400">STUDENT</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Account Created Date</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    {student.createdAt ? new Date(student.createdAt).toLocaleString() : 'Not Provided'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Last Profile Update</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    {student.updatedAt ? new Date(student.updatedAt).toLocaleString() : 'Not Provided'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Certificate PDF View Modal */}
      {selectedDoc && (
        <CertificatePreviewModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}

      {/* Delete Student Modal */}
      {showDeleteModal && (
        <DeleteStudentModal
          student={student}
          loading={deleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Quick Certificate Upload Modal */}
      {uploadModalOpen && (
        <UploadCertificateModal
          prefilledStudentId={student.studentId}
          prefilledDocumentTypeId={selectedDocTypeId}
          onClose={() => setUploadModalOpen(false)}
          onUploaded={() => {
            setUploadModalOpen(false);
          }}
        />
      )}

      {/* Delete Document Confirmation Modal */}
      {docToDelete && (
        <ConfirmationModal
          isOpen={Boolean(docToDelete)}
          title="Confirm Delete Document"
          message={`Are you sure you want to permanently delete "${docToDelete.documentTypeName || 'this document'}"? This action cannot be undone.`}
          confirmText="Delete Document"
          variant="danger"
          loading={actionLoadingId === docToDelete.id}
          onClose={() => setDocToDelete(null)}
          onConfirm={handleDeleteDocumentConfirmed}
        />
      )}
    </Layout>
  );
};

export default StudentProfile;
