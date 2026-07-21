/* Premium Kidrumi logo: a glossy clay badge with the teddy-bear mascot
   next to a gradient wordmark. Pure SVG + CSS, no hooks. */

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="logo-lockup">
      <svg
        className="logo-mark"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Kidrumi"
      >
        <defs>
          <linearGradient id="lg-badge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9b8bff" />
            <stop offset="0.55" stopColor="#7c6cf0" />
            <stop offset="1" stopColor="#ef7fb0" />
          </linearGradient>
          <linearGradient id="lg-fur" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3e2" />
            <stop offset="1" stopColor="#ffe2c4" />
          </linearGradient>
          <filter id="lg-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#5b4bc4" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* clay squircle */}
        <rect x="2" y="2" width="44" height="44" rx="15" fill="url(#lg-badge)" filter="url(#lg-shadow)" />
        {/* glossy top highlight */}
        <path d="M6 16 Q6 6 16 6 L32 6 Q40 6 41 13 Q24 20 6 16 Z" fill="#ffffff" opacity="0.28" />

        {/* teddy bear */}
        <g>
          <circle cx="16.5" cy="16" r="6" fill="url(#lg-fur)" />
          <circle cx="31.5" cy="16" r="6" fill="url(#lg-fur)" />
          <circle cx="16.5" cy="16" r="2.6" fill="#f6c8a0" />
          <circle cx="31.5" cy="16" r="2.6" fill="#f6c8a0" />
          <circle cx="24" cy="26" r="12" fill="url(#lg-fur)" />
          <ellipse cx="24" cy="30" rx="6.4" ry="5.2" fill="#ffe9cf" />
          <circle cx="19.4" cy="24.5" r="1.9" fill="#4a3b5c" />
          <circle cx="28.6" cy="24.5" r="1.9" fill="#4a3b5c" />
          <circle cx="20" cy="24" r="0.6" fill="#fff" />
          <circle cx="29.2" cy="24" r="0.6" fill="#fff" />
          <ellipse cx="24" cy="28.4" rx="2.1" ry="1.6" fill="#c8748f" />
          <path d="M21.6 31.4 Q24 33.6 26.4 31.4" stroke="#a86" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <circle cx="15" cy="29" r="2" fill="#ffc7d9" opacity="0.8" />
          <circle cx="33" cy="29" r="2" fill="#ffc7d9" opacity="0.8" />
        </g>

        {/* sparkle */}
        <path d="M39 9 c0.5 2 1 2.5 3 3 c-2 0.5 -2.5 1 -3 3 c-0.5 -2 -1 -2.5 -3 -3 c2 -0.5 2.5 -1 3 -3 Z" fill="#fff6c9" />
      </svg>

      <span className="logo-word">
        <span className="logo-word-k">Kid</span>rumi
      </span>
    </span>
  );
}
