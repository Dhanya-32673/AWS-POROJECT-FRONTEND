import api from './api';
import apiCache from '../utils/apiCache';

export const OFFICIAL_CAMPUSES = [
  "TITANIC",
  "SUSRUTHA",
  "DHANVANTARI",
  "GIRLS",
  "VAIDEHI",
  "MEDEX",
  "AIIMS CCO",
  "CCO",
  "ABDUL KALAM",
  "DCO",
  "INDRA BHAVAN",
  "APARNA",
  "VISWAKARMA",
  "VASISTA",
  "GARUDA",
  "GCO",
  "ADITHYA CO",
  "VAARAHI"
];

export const academicService = {
  // Official Campuses Master Data & Campus Management
  getOfficialCampuses: async () => {
    const cacheKey = '/campuses';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;
    try {
      const response = await api.get('/campuses');
      apiCache.set(cacheKey, response.data, 60000);
      return response.data;
    } catch (err) {
      return OFFICIAL_CAMPUSES.map((name, idx) => ({
        id: idx + 1,
        name,
        code: name.replace(/\s+/g, '_'),
        displayOrder: idx + 1,
        active: true,
        totalStudents: 0
      }));
    }
  },

  getCampuses: async () => {
    return academicService.getOfficialCampuses();
  },

  getCampus: async (id) => {
    const response = await api.get(`/campuses/${id}`);
    return response.data;
  },

  createCampus: async (campusData) => {
    const response = await api.post('/campuses', campusData);
    apiCache.clear('/campuses');
    return response.data;
  },

  updateCampus: async (id, campusData) => {
    const response = await api.put(`/campuses/${id}`, campusData);
    apiCache.clear('/campuses');
    return response.data;
  },

  deleteCampus: async (id) => {
    const response = await api.delete(`/campuses/${id}`);
    apiCache.clear('/campuses');
    return response.data;
  },

  getCampusStudents: async (campusId) => {
    const response = await api.get(`/campuses/${campusId}/students`);
    return response.data;
  },

  assignStudentsToCampus: async (campusId, studentIds) => {
    const response = await api.post(`/campuses/${campusId}/students`, { studentIds });
    apiCache.clear('/campuses');
    return response.data;
  },

  removeStudentFromCampus: async (campusId, studentId) => {
    const response = await api.delete(`/campuses/${campusId}/students/${studentId}`);
    apiCache.clear('/campuses');
    return response.data;
  },

  removeStudentsFromCampus: async (campusId, studentIds) => {
    const response = await api.post(`/campuses/${campusId}/remove-students`, studentIds);
    apiCache.clear('/campuses');
    return response.data;
  },

  getCampusNames: async () => {
    try {
      const response = await api.get('/campuses/names');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (e) {
      // fallback
    }
    return OFFICIAL_CAMPUSES;
  },

  // Groups (Cached for 5 minutes)
  getAllGroups: async () => {
    const cacheKey = '/academic/groups';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;
    const response = await api.get('/academic/groups');
    apiCache.set(cacheKey, response.data, 300000);
    return response.data;
  },

  createGroup: async (groupData) => {
    const response = await api.post('/academic/groups', groupData);
    apiCache.clear('/academic/groups');
    return response.data;
  },

  deleteGroup: async (id) => {
    const response = await api.delete(`/academic/groups/${id}`);
    apiCache.clear('/academic/groups');
    return response.data;
  },

  // Sections
  getAllSections: async (forceRefresh = false) => {
    const cacheKey = '/academic/sections';
    if (!forceRefresh) {
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;
    }
    const response = await api.get('/academic/sections');
    apiCache.set(cacheKey, response.data, 60000);
    return response.data;
  },

  getSectionStats: async () => {
    const response = await api.get('/academic/sections/stats');
    return response.data;
  },

  getSection: async (id) => {
    const response = await api.get(`/academic/sections/${id}`);
    return response.data;
  },

  createSection: async (sectionData) => {
    const response = await api.post('/academic/sections', sectionData);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  updateSection: async (id, sectionData) => {
    const response = await api.put(`/academic/sections/${id}`, sectionData);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  toggleSectionStatus: async (id, active) => {
    const response = await api.patch(`/academic/sections/${id}/status`, { active });
    apiCache.clear('/academic/sections');
    return response.data;
  },

  deleteSection: async (id) => {
    const response = await api.delete(`/academic/sections/${id}`);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  getSectionMembers: async (id) => {
    const response = await api.get(`/academic/sections/${id}/members`);
    return response.data;
  },

  getAvailableStudents: async (id, params = {}) => {
    const response = await api.get(`/academic/sections/${id}/available-students`, { params });
    return response.data;
  },

  assignStudentsToSection: async (id, studentIds) => {
    const response = await api.post(`/academic/sections/${id}/assign`, { studentIds });
    apiCache.clear('/academic/sections');
    return response.data;
  },

  removeStudentFromSection: async (id, studentId) => {
    const response = await api.delete(`/academic/sections/${id}/members/${studentId}`);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  removeStudentsFromSection: async (id, studentIds) => {
    const response = await api.post(`/academic/sections/${id}/remove-students`, studentIds);
    apiCache.clear('/academic/sections');
    return response.data;
  },

  exportSectionsExcel: async () => {
    return await api.get('/academic/sections/export/excel', {
      responseType: 'blob'
    });
  },

  exportSectionStudentsExcel: async (id) => {
    return await api.get(`/academic/sections/${id}/export/excel`, {
      responseType: 'blob'
    });
  }
};

export default academicService;
