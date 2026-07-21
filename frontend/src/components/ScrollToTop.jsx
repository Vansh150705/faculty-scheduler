import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets scroll position to the top on every route change so navigating to a
// new page doesn't leave you halfway down the previous one. Renders nothing.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
};

export default ScrollToTop;
