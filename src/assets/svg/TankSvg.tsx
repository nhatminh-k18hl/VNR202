import React from 'react';

interface TankSvgProps {
  color?: string;
  tankNumber?: string;
  isMoving?: boolean;
  hasShield?: boolean;
  hasSpeedBoost?: boolean;
  isShellShocked?: boolean;
  className?: string;
}

export const TankSvg: React.FC<TankSvgProps> = ({
  color = '#2563EB',
  tankNumber = '390',
  isMoving = false,
  hasShield = false,
  hasSpeedBoost = false,
  isShellShocked = false,
  className = 'w-32 h-20',
}) => {
  return (
    <div className={`relative inline-block select-none ${className} ${isShellShocked ? 'shake-active opacity-85' : ''}`}>
      {/* Vòng hào quang khiên thép bảo vệ (Lá chắn Trại Davis) */}
      {hasShield && (
        <div className="absolute -inset-2.5 rounded-full border-2 border-emerald-400 bg-emerald-400/15 animate-pulse pointer-events-none shadow-[0_0_18px_rgba(52,211,153,0.5)] z-20" />
      )}

      {/* Hiệu ứng bị choáng váng do trúng đạn pháo */}
      {isShellShocked && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-red-600/95 text-[10px] font-black text-white px-2 py-0.5 rounded-full shadow-lg border border-amber-300 animate-bounce">
          <span>⚠️ BỊ CHOÁNG</span>
        </div>
      )}

      {/* Ngọn lửa đẩy Mệnh lệnh Thần tốc phía sau ống xả */}
      {hasSpeedBoost && (
        <div className="absolute left-[-18px] top-[40px] z-0 pointer-events-none flex items-center">
          <div className="w-6 h-3 bg-gradient-to-l from-amber-500 via-orange-400 to-transparent rounded-l-full animate-ping opacity-90" />
          <div className="w-5 h-2.5 bg-gradient-to-l from-red-600 to-yellow-300 rounded-l-full animate-pulse" />
        </div>
      )}

      {/* MẶT ĐẤT & VỆT ĐỊA HÌNH DI CHUYỂN DƯỚI GẦM XE (MOVING GROUND) */}
      <div className="absolute -bottom-2.5 inset-x-0 h-3 overflow-hidden pointer-events-none z-0">
        <div className={`flex w-[200%] h-full items-center ${isMoving ? 'tank-ground-moving' : ''}`}>
          <div className="w-1/2 flex items-center justify-between border-b-2 border-stone-400/40 dark:border-stone-600/50">
            <span className="w-3 h-0.5 bg-stone-500/50 rounded-full inline-block" />
            <span className="w-1.5 h-1 bg-stone-600/60 rounded-full inline-block" />
            <span className="w-5 h-0.5 bg-stone-400/40 rounded-full inline-block" />
            <span className="w-2 h-1 bg-amber-700/40 rounded-full inline-block" />
            <span className="w-4 h-0.5 bg-stone-500/50 rounded-full inline-block" />
          </div>
          <div className="w-1/2 flex items-center justify-between border-b-2 border-stone-400/40 dark:border-stone-600/50">
            <span className="w-3 h-0.5 bg-stone-500/50 rounded-full inline-block" />
            <span className="w-1.5 h-1 bg-stone-600/60 rounded-full inline-block" />
            <span className="w-5 h-0.5 bg-stone-400/40 rounded-full inline-block" />
            <span className="w-2 h-1 bg-amber-700/40 rounded-full inline-block" />
            <span className="w-4 h-0.5 bg-stone-500/50 rounded-full inline-block" />
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 200 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible relative z-10"
      >
        <defs>
          <pattern id={`tread-${tankNumber}`} width="8" height="12" patternUnits="userSpaceOnUse">
            <rect width="6" height="10" rx="1" fill="#1C1F1D" />
            <line x1="1" y1="5" x2="5" y2="5" stroke="#4B5563" strokeWidth="1" />
          </pattern>

          <linearGradient id={`hullGrad-${tankNumber}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A614D" />
            <stop offset="50%" stopColor="#354837" />
            <stop offset="100%" stopColor="#223024" />
          </linearGradient>

          <radialGradient id={`turretGrad-${tankNumber}`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#556E58" />
            <stop offset="70%" stopColor="#354837" />
            <stop offset="100%" stopColor="#1E2B20" />
          </radialGradient>
        </defs>

        {isMoving && (
          <g className="animate-pulse opacity-70">
            <circle cx="16" cy="44" r="4" fill="#9CA3AF" opacity="0.6" />
            <circle cx="10" cy="40" r="6" fill="#6B7280" opacity="0.4" />
            <circle cx="4" cy="35" r="7" fill="#4B5563" opacity="0.3" />
          </g>
        )}

        {/* Lá cờ Giải phóng */}
        <g transform="translate(68, 6)">
          <line x1="0" y1="0" x2="0" y2="34" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="0" r="2" fill="#FBBF24" />

          <g className="origin-left">
            <path d="M 0,0 Q 15,-2 30,0 L 30,11 Q 15,9 0,11 Z" fill="#DA251D" />
            <path d="M 0,11 Q 15,9 30,11 L 30,22 Q 15,20 0,22 Z" fill="#0072CE" />
            <polygon
              points="15,6.5 16.5,10 20.5,10 17.5,12 18.5,15.5 15,13.5 11.5,15.5 12.5,12 9.5,10 13.5,10"
              fill="#FFFF00"
              stroke="#DA251D"
              strokeWidth="0.5"
            />
          </g>
        </g>

        {/* Nòng pháo */}
        <g id="main-cannon">
          <rect x="110" y="44" width="75" height="5" rx="1.5" fill="#2E3C30" stroke="#1C261E" strokeWidth="1" />
          <rect x="165" y="43" width="12" height="7" rx="1" fill="#222E24" />
          <rect x="182" y="43" width="6" height="7" rx="1" fill="#18221A" />
        </g>

        {/* Thân xe tăng */}
        <g id="hull">
          <path
            d="M 22 56 L 165 56 L 175 64 L 178 78 L 20 78 L 15 65 Z"
            fill={`url(#hullGrad-${tankNumber})`}
            stroke="#1D281F"
            strokeWidth="1.5"
          />
          <path d="M 160 56 L 175 64 L 178 78 L 168 78 L 150 56 Z" fill="#28372A" opacity="0.6" />
          <line x1="26" y1="62" x2="160" y2="62" stroke="#4F6852" strokeWidth="1" opacity="0.7" />

          <rect x="8" y="58" width="12" height="14" rx="2" fill="#243026" stroke="#151E17" strokeWidth="1" />
          <line x1="10" y1="63" x2="18" y2="63" stroke="#3D5040" strokeWidth="1" />
          <line x1="10" y1="67" x2="18" y2="67" stroke="#3D5040" strokeWidth="1" />
        </g>

        {/* Tháp pháo */}
        <g id="turret">
          <path
            d="M 62 56 C 62 38, 126 38, 130 56 Z"
            fill={`url(#turretGrad-${tankNumber})`}
            stroke="#1B251D"
            strokeWidth="1.5"
          />
          <ellipse cx="80" cy="40" rx="9" ry="3.5" fill="#263428" stroke="#1B251D" strokeWidth="1" />
          <line x1="77" y1="38" x2="77" y2="42" stroke="#485E4B" strokeWidth="1" />

          {/* Số hiệu xe tăng */}
          <rect x="84" y="44" width="28" height="11" rx="2" fill="#000000" opacity="0.5" />
          <text
            x="98"
            y="53"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="9"
            fontWeight="900"
            fontFamily="monospace"
            letterSpacing="1"
          >
            {tankNumber}
          </text>

          <rect x="70" y="52" width="56" height="3" fill={color} opacity="0.9" rx="1" />
        </g>

        {/* Dải xích tĩnh */}
        <g id="tracks">
          <rect
            x="28"
            y="76"
            width="144"
            height="26"
            rx="13"
            fill="#111813"
            stroke="#263328"
            strokeWidth="2"
          />
          <rect
            x="29"
            y="77"
            width="142"
            height="24"
            rx="12"
            fill={`url(#tread-${tankNumber})`}
          />

          {[48, 73, 98, 123, 148].map((cx, idx) => (
            <g key={idx}>
              <circle cx={cx} cy="89" r="10.5" fill="#1A201C" stroke="#2B382E" strokeWidth="1" />
              <circle cx={cx} cy="89" r="8" fill="#3D5040" />
              <circle cx={cx} cy="89" r="4" fill="#253227" stroke="#162018" strokeWidth="1" />
              <circle cx={cx} cy="89" r="1.5" fill="#9CA3AF" />
              <circle cx={cx} cy="84" r="1" fill="#151C16" />
              <circle cx={cx} cy="94" r="1" fill="#151C16" />
              <circle cx={cx - 5} cy="89" r="1" fill="#151C16" />
              <circle cx={cx + 5} cy="89" r="1" fill="#151C16" />
            </g>
          ))}

          <circle cx="34" cy="89" r="5" fill="#2A372C" stroke="#111813" strokeWidth="1" />
          <circle cx="166" cy="89" r="5" fill="#2A372C" stroke="#111813" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};
