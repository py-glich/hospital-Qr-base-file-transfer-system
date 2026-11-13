import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const ScrollButtons = () => {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  const checkScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    setCanScrollUp(scrollTop > 60);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 60);
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    checkScroll();

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        disabled={!canScrollUp}
        title="Scroll to Top"
        className={`w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-300/80 shadow-lg flex items-center justify-center text-teal-800 transition-all duration-200 cursor-pointer ${
          canScrollUp
            ? 'opacity-100 hover:bg-teal-700 hover:text-white hover:scale-105 active:scale-95 shadow-teal-900/10'
            : 'opacity-40 cursor-not-allowed hover:bg-white'
        }`}
      >
        <ChevronUp className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Scroll to Bottom */}
      <button
        onClick={scrollToBottom}
        disabled={!canScrollDown}
        title="Scroll to Bottom"
        className={`w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-300/80 shadow-lg flex items-center justify-center text-teal-800 transition-all duration-200 cursor-pointer ${
          canScrollDown
            ? 'opacity-100 hover:bg-teal-700 hover:text-white hover:scale-105 active:scale-95 shadow-teal-900/10'
            : 'opacity-40 cursor-not-allowed hover:bg-white'
        }`}
      >
        <ChevronDown className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
};
