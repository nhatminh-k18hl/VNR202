import React from 'react';

interface TankSvgProps {
  color?: string;
  tankNumber?: string;
  isMoving?: boolean;
  hasShield?: boolean;
  hasSpeedBoost?: boolean;
  isSlowed?: boolean;
  isDebuffed?: boolean;
  className?: string;
}

export const TankSvg: React.FC<TankSvgProps> = ({
  color = '#3B82F6',
  tankNumber = '390',
  isMoving = false,
  hasShield = false,
  hasSpeedBoost = false,
  isSlowed = false,
  isDebuffed = false,
  className = 'w-28 h-16',
}) => {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Vòng hào quang khiên bảo vệ (Lá chắn Trại Davis) */}
      {hasShield && (
        <div className="absolute -inset-2 rounded-full border-2 border-emerald-400 bg-emerald-400/20 animate-pulse pointer-events-none shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
      )}

      {/* Hiệu ứng khói mù / rào chắn khi bị làm chậm hoặc dính Nghi binh Pleiku */}
      {(isSlowed || isDebuffed) && (
        <div className="absolute -top-1 -right-3 z-20 flex items-center gap-1 bg-red-950/90 border border-red-500 text-[9px] font-black text-red-200 px-1.5 py-0.5 rounded shadow animate-bounce">
          <span>{isSlowed ? '🚧 Chặn đường 7' : '🎭 Nghi binh'}</span>
        </div>
      )}

      {/* Ngọn lửa đẩy thần tốc phía sau xe tăng */}
      {hasSpeedBoost && (
        <div className="absolute left-[-16px] top-[38px] z-0 pointer-events-none flex items-center">
          <div className="w-5 h-3 bg-gradient-to-l from-orange-500 via-amber-400 to-transparent rounded-l-full animate-ping opacity-80" />
          <div className="w-4 h-2 bg-gradient-to-l from-red-600 to-yellow-300 rounded-l-full animate-pulse" />
        </div>
      )}

      <svg
        viewBox="0 0 200 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Pattern xích xe tăng */}
          <pattern id={`tread-${tankNumber}`} width="8" height="12" patternUnits="userSpaceOnUse">
            <rect width="6" height="10" rx="1" fill="#1C1F1D" />
            <line x1="1" y1="5" x2="5" y2="5" stroke="#374151" strokeWidth="1" />
          </pattern>

          {/* Gradient vỏ thép xe tăng */}
          <linearGradient id={`hullGrad-${tankNumber}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A614D" />
            <stop offset="50%" stopColor="#354837" />
            <stop offset="100%" stopColor="#223024" />
          </linearGradient>

          {/* Gradient tháp pháo vòm T-54 */}
          <radialGradient id={`turretGrad-${tankNumber}`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#556E58" />
            <stop offset="70%" stopColor="#354837" />
            <stop offset="100%" stopColor="#1E2B20" />
          </radialGradient>
        </defs>

        {/* Khói xả động cơ khi đang tiến quân */}
        {isMoving && (
          <g className="animate-pulse opacity-70">
            <circle cx="16" cy="44" r="4" fill="#9CA3AF" opacity="0.6" />
            <circle cx="10" cy="40" r="6" fill="#6B7280" opacity="0.4" />
            <circle cx="4" cy="35" r="7" fill="#4B5563" opacity="0.3" />
          </g>
        )}

        {/* CỘT CỜ VÀ LÁ CỜ MẶT TRẬN DÂN TỘC GIẢI PHÓNG MIỀN NAM VIỆT NAM */}
        <g transform="translate(68, 6)">
          {/* Cán cờ */}
          <line x1="0" y1="0" x2="0" y2="34" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
          {/* Nắp cán cờ bằng đồng thau */}
          <circle cx="0" cy="0" r="2" fill="#FBBF24" />

          {/* Lá cờ giải phóng (Nửa đỏ trên, nửa xanh lam dưới, ngôi sao vàng ở giữa) */}
          <g className="origin-left animate-[wiggle_1.5s_ease-in-out_infinite]">
            {/* Nửa trên đỏ */}
            <path d="M 0,0 Q 15,-2 30,0 L 30,11 Q 15,9 0,11 Z" fill="#DA251D" />
            {/* Nửa dưới xanh dương */}
            <path d="M 0,11 Q 15,9 30,11 L 30,22 Q 15,20 0,22 Z" fill="#0072CE" />
            {/* Ngôi sao vàng 5 cánh ở chính giữa */}
            <polygon
              points="15,6.5 16.5,10 20.5,10 17.5,12 18.5,15.5 15,13.5 11.5,15.5 12.5,12 9.5,10 13.5,10"
              fill="#FFFF00"
              stroke="#DA251D"
              strokeWidth="0.4"
            />
          </g>
        </g>

        {/* NÒNG PHÁO CHÍNH 100MM */}
        <g>
          {/* Loa giảm giật đầu nòng */}
          <rect x="188" y="44" width="8" height="7" rx="1.5" fill="#1F2937" />
          {/* Nòng pháo dài */}
          <rect x="110" y="45.5" width="80" height="4" fill="#2E3D30" stroke="#1F2937" strokeWidth="0.5" />
          {/* Bọc bọng khói giữa nòng */}
          <rect x="148" y="44.5" width="12" height="6" rx="1" fill="#3E4F40" />
        </g>

        {/* THÂN XE TĂNG (HULL) */}
        <g>
          {/* Thùng nhiên liệu phụ phía đuôi xe */}
          <rect x="22" y="40" width="10" height="16" rx="3" fill="#2D3D2F" stroke="#1A251B" strokeWidth="1" />
          <rect x="34" y="40" width="10" height="16" rx="3" fill="#2D3D2F" stroke="#1A251B" strokeWidth="1" />

          {/* Thân chính giáp nghiêng Liên Xô */}
          <path
            d="M 32,54 L 160,54 L 178,66 L 168,78 L 30,78 L 24,66 Z"
            fill={`url(#hullGrad-${tankNumber})`}
            stroke="#1B261D"
            strokeWidth="1.5"
          />

          {/* Dải chắn bùn (fender) phía trên dải xích */}
          <rect x="24" y="74" width="152" height="4" fill="#263528" rx="1" />
        </g>

        {/* THÁP PHÁO VÒM NẤM T-54 (TURRET) */}
        <g>
          {/* Vòm tháp pháo */}
          <ellipse
            cx="98"
            cy="47"
            rx="32"
            ry="16"
            fill={`url(#turretGrad-${tankNumber})`}
            stroke="#1E2B20"
            strokeWidth="1.5"
          />

          {/* Cửa vòm trưởng xe & kính tiềm vọng */}
          <ellipse cx="80" cy="38" rx="8" ry="4" fill="#2E3E31" stroke="#162217" strokeWidth="1" />
          <rect x="78" y="34" width="5" height="4" rx="1" fill="#4B5563" />

          {/* Đèn hồng ngoại tác chiến đêm */}
          <circle cx="118" cy="42" r="3.5" fill="#1F2937" stroke="#9CA3AF" strokeWidth="0.5" />
          <circle cx="118" cy="42" r="2" fill="#E5E7EB" />

          {/* SỐ HIỆU XE TĂNG (390, 843...) IN ĐẬM TRÊN THÁP PHÁO */}
          <rect x="85" y="44" width="26" height="11" rx="2" fill="#000000" opacity="0.4" />
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

          {/* Dải ruy băng nhận diện màu sắc đội đua */}
          <rect x="70" y="52" width="56" height="3" fill={color} opacity="0.9" rx="1" />
        </g>

        {/* DÀI XÍCH VÀ CÁC BÁNH CHỊU NẶNG (TREADS & ROAD WHEELS) */}
        <g>
          {/* Khung dải xích bao quanh */}
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

          {/* Lớp xích thép có hoa gai */}
          <rect
            x="29"
            y="77"
            width="142"
            height="24"
            rx="12"
            fill={`url(#tread-${tankNumber})`}
          />

          {/* 5 BÁNH CHỊU LỰC LỚN ĐẶC TRƯNG T-54 (CÓ LỖ TẢN NHIỆT VÀ ỐC TRỤC) */}
          {[48, 73, 98, 123, 148].map((cx, idx) => (
            <g key={idx} className={isMoving ? 'animate-[spin_2s_linear_infinite] origin-center' : ''}>
              {/* Vành lốp cao su */}
              <circle cx={cx} cy="89" r="10.5" fill="#1A201C" stroke="#2B382E" strokeWidth="1" />
              {/* Đĩa bánh thép */}
              <circle cx={cx} cy="89" r="8" fill="#3D5040" />
              {/* Trục giữa và ốc siết */}
              <circle cx={cx} cy="89" r="4" fill="#253227" stroke="#162018" strokeWidth="1" />
              <circle cx={cx} cy="89" r="1.5" fill="#9CA3AF" />
              {/* Lỗ tản nhiệt đĩa bánh */}
              <circle cx={cx} cy="84" r="1" fill="#151C16" />
              <circle cx={cx} cy="94" r="1" fill="#151C16" />
              <circle cx={cx - 5} cy="89" r="1" fill="#151C16" />
              <circle cx={cx + 5} cy="89" r="1" fill="#151C16" />
            </g>
          ))}

          {/* Bánh dẫn hướng trước & bánh chủ động sau */}
          <circle cx="34" cy="89" r="5" fill="#2A372C" stroke="#111813" strokeWidth="1" />
          <circle cx="166" cy="89" r="5" fill="#2A372C" stroke="#111813" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};
