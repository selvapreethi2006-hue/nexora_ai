import React from 'react';

interface NexoraLogoProps {
  className?: string;
  size?: number;
  withSparkAnimation?: boolean;
}

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  className = '',
  size = 32,
  withSparkAnimation = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(124,58,237,0.5)]"
      >
        <defs>
          <linearGradient id="nexoraGrad1" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <linearGradient id="nexoraGrad2" x1="85" y1="15" x2="15" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle shield polygon */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="22"
          fill="#0B132B"
          stroke="url(#nexoraGrad1)"
          strokeWidth="2.5"
          strokeOpacity="0.4"
        />

        {/* Abstract Futuristic 'N' Shapes */}
        {/* Left vertical pillar */}
        <path
          d="M26 74V26C26 23.7909 27.7909 22 30 22H32C34.2091 22 36 23.7909 36 26V74C36 76.2091 34.2091 78 32 78H30C27.7909 78 26 76.2091 26 74Z"
          fill="url(#nexoraGrad1)"
        />

        {/* Dynamic Diagonal beam */}
        <path
          d="M31 24L69 76"
          stroke="url(#nexoraGrad1)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Right vertical pillar */}
        <path
          d="M64 74V26C64 23.7909 65.7909 22 68 22H70C72.2091 22 74 23.7909 74 26V74C74 76.2091 72.2091 78 70 78H68C65.7909 78 64 76.2091 64 74Z"
          fill="url(#nexoraGrad2)"
        />

        {/* AI-Inspired 4-point Spark / Star in top-right */}
        <g className={withSparkAnimation ? 'animate-pulse' : ''} filter="url(#glow)">
          <path
            d="M74 15C74 19.5 70.5 23 66 23C70.5 23 74 26.5 74 31C74 26.5 77.5 23 82 23C77.5 23 74 19.5 74 15Z"
            fill="#22D3EE"
          />
          <circle cx="74" cy="23" r="1.5" fill="#FFFFFF" />
        </g>

        {/* Minor accent spark in bottom-left */}
        <path
          d="M22 69C22 71.5 20 73.5 17.5 73.5C20 73.5 22 75.5 22 78C22 75.5 24 73.5 26.5 73.5C24 73.5 22 71.5 22 69Z"
          fill="#A78BFA"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};
