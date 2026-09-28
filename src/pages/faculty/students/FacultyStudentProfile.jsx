import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FacultyLayout from '../../../layouts/FacultyLayout';
import CertificateStatusBadge from '../../../components/certificates/CertificateStatusBadge';
import CertificateProgress from '../../../components/certificates/CertificateProgress';
import CertificatePreviewModal from '../../../components/certificates/CertificatePreviewModal';
import studentService from '../../../services/studentService';
import certificateService from '../../../services/certificateService';
import StudentAvatar from '../../../components/common/StudentAvatar';
import { formatSectionName } from '../../../utils/studentDataFormatter';
import {
  ArrowLeft, CreditCard, User, Phone, Users, BookOpen, Award, Lock, Eye, AlertCircle
} from 'lucide-react';
import { usePageTitle } from '../../../hooks/usePageTitle';

const InfoField = ({ label, value, mono = false, highlight = false }) => (
  <div className={`p-3 rounded-xl border ${highlight ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/60' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/80'}`}>
    <span className={`block text-[10px] font-extrabold uppercase tracking-wide mb-0.5 ${highlight ? 'text-blue-500' : 'text-slate-400'}`}>
      {label}
    </span>
    <span className={`text-xs font-bold ${mono ? 'font-mono' : ''} ${highlight ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-100'}`}>
      {value || '—'}
    </span>
  </div>
);

export const FacultyStudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  usePageTitle(student?.fullName ? `${student.fullName} - Student Profile` : 'Student Profile');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PERSONAL');
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await studentService.getStudentById(id);
        setStudent(data);
        const docs = await certificateService.getStudentDocuments(id);
        setDocuments(docs || []);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Student profile not found or unauthorized.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;

  if (loading) {
    return (
      <FacultyLayout>
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading student profile...</p>
        </div>
      </FacultyLayout>
    );
  }

  if (error || !student) {
    return (
      <FacultyLayout>
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Profile Unavailable</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={() => navigate('/faculty/students/search')}
            className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Back to Search
          </button>
        </div>
      </FacultyLayout>
    );
  }

  const TABS = [
    { id: 'PERSONAL',      label: 'Basic Info',    icon: User },
    { id: 'CONTACT',       label: 'Contact',       icon: Phone },
    { id: 'FAMILY',        label: 'Family',        icon: Users },
    { id: 'ACADEMIC',      label: 'Academic',      icon: BookOpen },
    { id: 'CERTIFICATES',  label: 'Certificates',  icon: Award },
  ];

  return (
    <FacultyLayout>
      <div className="space-y-6 font-sans">

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <StudentAvatar
              src={student.profilePhotoUrl}
              name={student.fullName}
              studentId={student.studentId}
              size="xl"
              rounded="rounded-2xl"
              className="w-20 h-20 border-2 border-white/30 shadow-lg shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${student.status === 'ACTIVE' ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-white/10 text-white/70 border border-white/20'}`}>
                  {student.status || 'ACTIVE'}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">{student.fullName}</h1>
              <div className="flex flex-wrap gap-3 text-[11px] text-blue-100">
                <span className="font-mono font-bold">{student.studentId}</span>
                <span>·</span>
                <span>Adm No: <span className="font-mono font-bold text-white">{student.admissionNumber}</span></span>
                <span>·</span>
                <span><span className="font-bold text-white">{formatSectionName(student.section)}</span></span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate('/faculty/students/search')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-2xl transition cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => navigate(`/faculty/students/${student.studentId}/id-card`)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-blue-600 text-xs font-bold rounded-2xl shadow-lg transition cursor-pointer min-h-[44px]"
            >
              <CreditCard className="w-4 h-4" />
              <span>ID Card</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Group',    value: student.branchGroup || 'MPC',                color: 'blue'   },
            { label: 'Year',     value: student.intermediateYear || '1st Year',       color: 'blue'   },
            { label: 'Section',  value: `Section ${student.section || 'A'}`,          color: 'blue'   },
            { label: 'Certs',    value: `${verifiedCount} Verified / ${documents.length} Total`, color: 'green' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3.5 sm:p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <p className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5 truncate">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabbed Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none touch-pan-x">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 text-[11px] font-extrabold uppercase tracking-wide border-b-2 transition shrink-0 cursor-pointer min-h-[44px] ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'PERSONAL' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoField label="Student ID"       value={student.studentId} mono highlight />
                <InfoField label="Admission Number" value={student.admissionNumber} mono />
                <InfoField label="Full Name"        value={student.fullName} />
                <InfoField label="Date of Birth"    value={student.dateOfBirth} />
                <InfoField label="Gender"           value={student.gender} />
                <InfoField label="Nationality"      value={student.nationality || 'Indian'} />
                <InfoField label="Religion"         value={student.religion} />
                <InfoField label="Category"         value={student.category || student.casteCategory} />
                <InfoField label="Masked Aadhaar"   value={student.maskedAadhaar || (student.aadhaarNumber ? `•••• •••• ${student.aadhaarNumber.slice(-4)}` : '•••• •••• ••••')} mono highlight />
              </div>
            )}

            {activeTab === 'CONTACT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoField label="Mobile Number"    value={student.mobileNumber} />
                <InfoField label="Alternate Mobile" value={student.alternateMobile} />
                <InfoField label="Email Address 1"  value={student.emailAddress1 || student.email} />
                <InfoField label="Email Address 2"  value={student.emailAddress2} />
              </div>
            )}

            {activeTab === 'FAMILY' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoField label="Father Name"      value={student.fatherName} />
                <InfoField label="Mother Name"      value={student.motherName} />
              </div>
            )}

            {activeTab === 'ACADEMIC' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoField label="Academic Year"      value={student.academicYear} />
                <InfoField label="Intermediate Group" value={student.branchGroup} />
                <InfoField label="Intermediate Year"  value={student.intermediateYear} />
                <InfoField label="Batch"              value={student.batch} />
                <InfoField label="Admission Type"     value={student.admissionType} />
                <InfoField label="Hostel / Day"       value={student.hostelDayScholar === 'HOSTEL' ? 'Hostel' : 'Day Scholar'} />
              </div>
            )}

            {activeTab === 'CERTIFICATES' && (
              <div className="space-y-4">
                <CertificateProgress completedCount={verifiedCount} totalCount={10} />

                {/* Mobile Certificate Card Stack (< md) */}
                <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                  {documents.length > 0 ? (
                    documents.map((d) => (
                      <div key={d.id} className="p-4 space-y-2.5 bg-white dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{d.documentTypeName}</h4>
                            <span className="text-[10px] text-slate-400 block">{d.category}</span>
                          </div>
                          <CertificateStatusBadge status={d.status} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Uploaded: {d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '—'}</span>
                          <button
                            onClick={() => setSelectedDoc(d)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl transition cursor-pointer min-h-[44px]"
                          >
                            <Eye className="w-4 h-4" /> <span>Preview</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No certificates uploaded for this student yet.
                    </div>
                  )}
                </div>

                {/* Desktop Certificate Table (md+) */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Certificate Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Upload Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {documents.length > 0 ? documents.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{d.documentTypeName}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{d.category}</td>
                          <td className="px-4 py-3">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-3"><CertificateStatusBadge status={d.status} /></td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedDoc(d)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-xl transition cursor-pointer min-h-[36px]"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                            No certificates uploaded for this student yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {selectedDoc && (
        <CertificatePreviewModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </FacultyLayout>
  );
};

export default FacultyStudentProfile;
