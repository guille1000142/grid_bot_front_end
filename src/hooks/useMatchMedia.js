import { useState, useEffect } from "react";

export const useMatchMedia = (mediaQuery, initialValue) => {
  const [isMatching, setIsMatching] = useState(initialValue);

  useEffect(() => {
    const watcher = window.matchMedia(mediaQuery);
    setIsMatching(watcher.matches);

    const listener = (matches) => {
      setIsMatching(matches.matches);
    };

    watcher.addEventListener("change", listener);

    return () => {
      return watcher.removeEventListener("change", listener);
    };
  }, [mediaQuery]);

  return isMatching;
};
