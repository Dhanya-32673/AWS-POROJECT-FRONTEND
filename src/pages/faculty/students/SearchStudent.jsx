import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CreditCard, Users, BookOpen, AlertCircle } from 'lucide-react';
import FacultyLayout from '../../../layouts/FacultyLayout';
import studentService from '../../../services/studentService';
import StudentAvatar from '../../../components/common/StudentAvatar';
import { formatSectionName, formatIntermediateYear } from '../../../utils/studentDataFormatter';

import { useDebounce } from '../../../hooks/useDebounce';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const SearchStudent = () => {
  usePageTitle('Search Students');
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const executeSearch = async () => {
      setLoading(true);
      setSearched(true);
      try {
        const res = await studentService.searchStudents(debouncedQuery.trim());
        setResults(res || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [debouncedQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
  };

  const statusColor = (status) => {
    const map = {
      ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      INACTIVE: 'bg-slate-100 text-slate-500 border border-slate-200',
    };
    return map[(status || '').toUpperCase()] || map.INACTIVE;
  };

  return (
    <FacultyLayout>
      <div className="space-y-5 sm:space-y-6 font-sans">

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden">
          <div className="space-y-2 relative z-10 text-left">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Faculty Access
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">Search Student</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Search by Student ID, Admission Number, Name, or Group.
            </p>
          </div>

          {/* Search Form inside banner */}
          <form onSubmit={handleSearch} className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter Student ID, Admission Number, or Name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/40 transition min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-white hover:bg-slate-50 text-blue-600 text-xs font-bold rounded-2xl shadow-lg transition disabled:opacity-50 shrink-0 cursor-pointer min-h-[44px]"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs py-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-slate-400">Searching student database...</p>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs py-16 flex flex-col items-center gap-3 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No Student Found</p>
            <p className="text-xs text-slate-400">No active student record matches "{query}"</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {results.length} result{results.length > 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((student) => (
                <div
                  key={student.studentId}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-blue-300 transition group"
                >
                  <StudentAvatar
                    src={student.profilePhotoUrl}
                    name={student.fullName}
                    studentId={student.studentId}
                    size="lg"
                    rounded="rounded-2xl"
                    className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-blue-100 dark:border-slate-700 shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-black text-blue-600">{student.studentId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${statusColor(student.status)}`}>
                        {student.status || 'ACTIVE'}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">{student.fullName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Adm No: <span className="font-mono font-bold">{student.admissionNumber || '—'}</span></p>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                      <div>
                        <span className="text-slate-400">Group:</span>{' '}
                        <span className="font-bold text-slate-700 dark:text-slate-300">{student.branchGroup || student.department || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Yr/Sec:</span>{' '}
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatIntermediateYear(student.intermediateYear || student.currentYear)} • {formatSectionName(student.section)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/faculty/students/${student.studentId}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition min-h-[40px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

      </div>
    </FacultyLayout>
  );
};

export default SearchStudent;
