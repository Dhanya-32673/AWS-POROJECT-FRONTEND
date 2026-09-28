import React, { useState } from 'react';
import { useStudentPortal } from '../../context/StudentPortalContext';
import { CertificatePreviewModal } from '../../components/certificates/CertificatePreviewModal';
import api from '../../services/api';
import toast from '../../utils/toastService';
import {
  Award,
  FileText,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Search,
  FileCheck,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';

export const StudentCertificatesPage = () => {
  usePageTitle('My Certificates');
  const { certificates, certificatesLoading, error, refreshCertificates } = useStudentPortal();
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc.id);
      const response = await api.get(`/documents/${doc.id}/file?download=true`, { responseType: 'blob' });
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalFileName || doc.documentTypeName || `certificate_${doc.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Unable to download document. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredCerts = certificates.filter((c) => {
    const term = searchTerm.toLowerCase();
    const docName = (c.documentTypeName || c.originalFileName || c.documentNumber || '').toLowerCase();
    const category = (c.category || '').toLowerCase();
    return docName.includes(term) || category.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              My Certificates
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              View your official certificates and documents &bull; Student Management System
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {certificatesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-lg text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Unable to Load Certificates</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {error || 'Unable to retrieve your certificates right now.'}
          </p>
          <button
            onClick={refreshCertificates}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredCerts.length === 0 ? (
        /* VALID EMPTY STATE (NOT AN ERROR) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {searchTerm ? 'No matching certificates found' : 'No certificates uploaded yet.'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              {searchTerm
                ? 'Try adjusting your search keywords to locate specific documents.'
                : 'Your official certificates, marksheets, and identity documents will appear here once verified and uploaded by the administration.'}
            </p>
          </div>
        </div>
      ) : (
        /* CERTIFICATES GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((doc) => {
            const isVerified = doc.status === 'VERIFIED';
            const isPending = doc.status === 'PENDING';
            const isRejected = doc.status === 'REJECTED';
            const isDownloading = downloadingId === doc.id;

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      {doc.category || 'CERTIFICATE'}
                    </span>

                    {isVerified ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {doc.status || 'Archived'}
                      </span>
                    )}
                  </div>

                  {/* Document Title */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={doc.documentTypeName || doc.originalFileName}>
                        {doc.documentTypeName || doc.originalFileName || 'Academic Certificate'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                        {doc.originalFileName || 'certificate.pdf'}
                      </p>
                    </div>
                  </div>

                  {/* Metadata List */}
                  <div className="space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-600 dark:text-slate-400">
                    {doc.documentNumber && (
                      <div className="flex justify-between">
                        <span>Document No:</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{doc.documentNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Upload Date:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recorded'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-xs transition cursor-pointer min-h-[40px]"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={isDownloading}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer min-h-[40px] disabled:opacity-50"
                  >
                    <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                    <span>{isDownloading ? 'Saving...' : 'Download'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reusable Certificate Preview Modal */}
      {previewDoc && (
        <CertificatePreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
};

export default StudentCertificatesPage;
