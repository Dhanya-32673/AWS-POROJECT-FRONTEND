import { useEffect } from 'react';
import { APP_TITLE_CASE } from '../constants/branding';

/**
 * Standardized browser document title hook
 * Sets "Student Management System | [PageTitle]" or "Student Management System"
 */
export const usePageTitle = (pageTitle) => {
  useEffect(() => {
    if (pageTitle && typeof pageTitle === 'string' && pageTitle.trim()) {
      document.title = `${APP_TITLE_CASE} | ${pageTitle.trim()}`;
    } else {
      document.title = APP_TITLE_CASE;
    }
  }, [pageTitle]);
};

export default usePageTitle;
