import { useEffect } from 'react';

// Sets the browser tab title for the current page and restores the base title
// on unmount. Keeps titles meaningful for bookmarks and browser history.
const BASE = 'Faculty Scheduler';

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : BASE;
    return () => {
      document.title = BASE;
    };
  }, [title]);
};

export default useDocumentTitle;
