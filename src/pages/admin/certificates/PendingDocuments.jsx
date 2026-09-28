import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import CertificateStatusBadge from '../../../components/certificates/CertificateStatusBadge';
import CertificatePreviewModal from '../../../components/certificates/CertificatePreviewModal';
import certificateService from '../../../services/certificateService';
import { Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';

import { useToast } from '../../../context/ToastContext';
import { useDataRefresh } from '../../../utils/dataSync';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const PendingDocuments = () => {
  usePageTitle('Pending Documents');
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const Layout = rawRole === 'FACULTY' ? FacultyLayout : AdminLayout;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const [uploadedRes, pendingRes] = await Promise.allSettled([
        certificateService.getCertificates({ status: 'UPLOADED', size: 100 }),
        certificateService.getCertificates({ status: 'PENDING',  size: 100 }),
      ]);

      const uploaded = uploadedRes.status === 'fulfilled' ? (uploadedRes.value?.content || []) : [];
      const pending  = pendingRes.status  === 'fulfilled' ? (pendingRes.value?.content  || []) : [];

      const merged = [...uploaded, ...pending]
        .filter((doc, idx, arr) => arr.findIndex((d) => d.id === doc.id) === idx)
        .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));

      setDocuments(merged);
    } catch (err) {
      console.error('Failed to load pending documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);
  useDataRefresh(['certificates'], fetchPending);

  const handleVerify = async (id) => {
    try {
      await certificateService.verifyDocument(id);
      showSuccess('Certificate verified successfully');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Verification failed:', err);
      const msg = err.response?.data?.message || 'Failed to verify document';
      showError(msg);
    }
  };

  const handleReject = async (id) => {
    try {
      await certificateService.rejectDocument(id, 'Rejected by Admin');
      showSuccess('Certificate rejected successfully');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Rejection failed:', err);
      const msg = err.response?.data?.message || 'Failed to reject document';
      showError(msg);
    }
  };

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Certificate Verification Queue
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Pending Document Approvals
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Certificates uploaded by students or faculty awaiting administrator verification.
            </p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shrink-0">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>

        {/* Table Container Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Loading pending documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">All Verification Requests Completed</h3>
              <p className="text-xs text-slate-500">There are currently zero pending documents in queue.</p>
            </div>
          ) : (
            <>
              {/* MOBILE STACKED CARDS (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{doc.documentTypeName}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{doc.studentName}</p>
                        <p className="text-xs font-mono font-bold text-blue-600">{doc.studentId}</p>
                      </div>
                      <CertificateStatusBadge status={doc.status} />
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}</span>
                      <span>By: {doc.uploadedBy || 'Admin'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="flex-1 min-w-[80px] py-2.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl inline-flex items-center justify-center min-h-[44px] cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-1.5" /> View
                      </button>
                      <button
                        onClick={() => handleVerify(doc.id)}
                        className="flex-1 min-w-[80px] py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center justify-center shadow-xs cursor-pointer min-h-[44px]"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Verify
                      </button>
                      <button
                        onClick={() => handleReject(doc.id)}
                        className="flex-1 min-w-[80px] py-2.5 px-3 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 rounded-xl inline-flex items-center justify-center cursor-pointer min-h-[44px]"
                      >
                        <XCircle className="w-4 h-4 mr-1.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="px-4 py-3.5">Student ID</th>
                      <th className="px-4 py-3.5">Student Name</th>
                      <th className="px-4 py-3.5">Certificate Type</th>
                      <th className="px-4 py-3.5">Upload Date</th>
                      <th className="px-4 py-3.5">Uploaded By</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{doc.studentId}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{doc.studentName}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">{doc.documentTypeName}</td>
                        <td className="px-4 py-3.5 text-slate-500">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3.5 text-slate-500">{doc.uploadedBy || 'Admin'}</td>
                        <td className="px-4 py-3.5">
                          <CertificateStatusBadge status={doc.status} />
                        </td>
                        <td className="px-4 py-3.5 text-right pr-6 space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl inline-flex items-center min-h-[36px]"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </button>
                          <button
                            onClick={() => handleVerify(doc.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center shadow-xs cursor-pointer min-h-[36px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verify
                          </button>
                          <button
                            onClick={() => handleReject(doc.id)}
                            className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 rounded-xl inline-flex items-center cursor-pointer min-h-[36px]"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {selectedDoc && (
          <CertificatePreviewModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
        )}
      </div>
    </Layout>
  );
};

export default PendingDocuments;
