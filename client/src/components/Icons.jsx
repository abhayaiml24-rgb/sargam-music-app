const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true };
export const Play = (p) => <svg {...base} {...p}><path d="M8 5v14l11-7z" /></svg>;
export const Pause = (p) => <svg {...base} {...p}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>;
export const Next = (p) => <svg {...base} {...p}><path d="M6 6l9 6-9 6zM17 6h2v12h-2z" /></svg>;
export const Prev = (p) => <svg {...base} {...p}><path d="M18 6l-9 6 9 6zM5 6h2v12H5z" /></svg>;
export const Plus = (p) => <svg {...base} {...p}><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>;
export const Heart = ({ filled, ...p }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.600-9 9-9 9z" />
  </svg>
);
export const Shuffle = (p) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
);
export const Repeat = ({ one, ...p }) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />
    {one && <text x="10" y="15" fontSize="8" fill="currentColor" stroke="none">1</text>}
  </svg>
);
export const Home = (p) => <svg {...base} {...p}><path d="M12 3 3 10v11h6v-6h6v6h6V10z" /></svg>;
export const Search = (p) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" {...p}>
    <circle cx="11" cy="11" r="6.500" /><path d="m20 20-4.200-4.200" />
  </svg>
);
export const Volume = (p) => <svg {...base} {...p}><path d="M4 9v6h4l5 4V5L8 9zM16 8.500a5 5 0 0 1 0 7l-1.400-1.400a3 3 0 0 0 0-4.200z" /></svg>;
