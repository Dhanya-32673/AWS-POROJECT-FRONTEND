import api from './api';

const facultyService = {
  // Get faculty statistics for summary cards
  getFacultyStats: async () => {
    const response = await api.get('/faculty/stats', { cache: false });
    return response.data;
  },

  // Search/List faculty with pagination and filters
  searchFaculty: async ({ query = '', group = '', status = '', page = 0, size = 10, sortBy = 'createdAt', direction = 'desc' } = {}) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (group && group !== 'ALL') params.append('group', group);
    if (status && status !== 'ALL') params.append('status', status);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('direction', direction);

    const response = await api.get(`/faculty?${params.toString()}`, { cache: false });
    return response.data;
  },

  // Get all faculty (unpaged, up to 1000)
  getAllFaculty: async (filters = {}) => {
    return facultyService.searchFaculty({ ...filters, page: 0, size: 1000 });
  },

  // Get single faculty profile
  getFacultyById: async (id) => {
    const response = await api.get(`/faculty/${id}`, { cache: false });
    return response.data;
  },

  // Create faculty member
  createFaculty: async (data) => {
    const response = await api.post('/faculty', data);
    return response.data;
  },

  // Update faculty member
  updateFaculty: async (id, data) => {
    const response = await api.put(`/faculty/${id}`, data);
    return response.data;
  },

  // Upload faculty profile photo
  uploadFacultyPhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/faculty/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Toggle faculty status (ACTIVE / INACTIVE)
  toggleFacultyStatus: async (id, status) => {
    const response = await api.patch(`/faculty/${id}/status`, { status });
    return response.data;
  },

  // Delete faculty member
  deleteFaculty: async (id) => {
    const response = await api.delete(`/faculty/${id}`);
    return response.data;
  },

  // Get assignments for a faculty member
  getAssignments: async (facultyId) => {
    const response = await api.get(`/faculty/${facultyId}/assignments`, { cache: false });
    return response.data;
  },

  // Add assignment to a faculty member
  addAssignment: async (facultyId, data) => {
    const response = await api.post(`/faculty/${facultyId}/assignments`, data);
    return response.data;
  },

  // Remove assignment from a faculty member
  removeAssignment: async (facultyId, assignmentId) => {
    const response = await api.delete(`/faculty/${facultyId}/assignments/${assignmentId}`);
    return response.data;
  },

  // Get current logged-in faculty assignments (used by StudentForm, MissingDocuments, ImportStudentsModal)
  getCurrentFacultyAssignments: async () => {
    const response = await api.get('/faculty/me/assignments', { cache: false });
    return response.data;
  },

  // Export faculty directory to Excel (.xlsx)
  exportFacultyToExcel: async ({ query = '', group = '', status = '' } = {}) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (group && group !== 'ALL') params.append('group', group);
    if (status && status !== 'ALL') params.append('status', status);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`/api/faculty/export/excel?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export faculty Excel file');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Faculty_Directory_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};

export default facultyService;
