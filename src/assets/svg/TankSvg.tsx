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
  className = 'w-32 h-20',
}) => {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* NỀN ĐỊA HÌNH KHI XE DI CHUYỂN: Bụi đỏ Trường Sơn & Vạch đường lướt qua */}
      {isMoving && (
        <div className="absolute inset-x-0 -bottom-1 h-3 pointer-events-none overflow-hidden z-0">
          {/* Lớp đất đỏ dã chiến cuộn về sau */}
          <div className="w-[200%] h-full flex animate-[moveTerrain_0.8s_linear_infinite]">
            <div className="w-1/2 h-full border-b-2 border-dashed border-amber-600/50 bg-gradient-to-t from-amber-950/40 to-transparent" />
            <div className="w-1/2 h-full border-b-2 border-dashed border-amber-600/50 bg-gradient-to-t from-amber-950/40 to-transparent" />
          </div>
        </div>
      )}

      {/* Vòng hào quang khiên bảo vệ (Lá chắn Trại Davis) */}
      {hasShield && (
        <div className="absolute -inset-2.5 rounded-full border-2 border-emerald-400 bg-emerald-400/20 animate-pulse pointer-events-none shadow-[0_0_20px_rgba(52,211,153,0.7)] z-20 flex items-center justify-center">
          <span className="text-[10px] font-black text-emerald-300 uppercase px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400 -mt-14 shadow">
            🛡️ LÁ CHẮN BẢO VỆ
          </span>
        </div>
      )}

      {/* Cảnh báo khi bị dính khói mù hoặc khựng lại do đạn pháo */}
      {(isSlowed || isDebuffed) && (
        <div className="absolute -top-2 -right-3 z-30 flex items-center gap-1 bg-red-950/90 border border-red-500 text-[9px] font-black text-red-200 px-2 py-0.5 rounded-md shadow-lg animate-bounce">
          <span>{isSlowed ? '💥 BỊ TRÚNG ĐẠN' : '🎭 KHÓI MÙ'}</span>
        </div>
      )}

      {/* Ngọn lửa đẩy thần tốc phía sau xe tăng */}
      {hasSpeedBoost && (
        <div className="absolute left-[-20px] top-[40px] z-0 pointer-events-none flex items-center">
          <div className="w-6 h-3 bg-gradient-to-l from-orange-500 via-amber-400 to-transparent rounded-l-full animate-ping opacity-80" />
          <div className="w-5 h-2 bg-gradient-to-l from-red-600 to-yellow-300 rounded-l-full animate-pulse" />
        </div>
      )}

      <svg
        viewBox="0 0 200 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-lg overflow-visible relative z-10 ${
          isMoving ? 'animate-[tankRumble_0.5s_ease-in-out_infinite]' : ''
        }`}
      >
        <defs>
          {/* Pattern xích xe tăng T-54 */}
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

        {/* Khói xả động cơ diesel & Bụi cuộn khi đang tiến quân */}
        {isMoving && (
          <g className="opacity-75">
            <circle cx="16" cy="44" r="5" fill="#9CA3AF" opacity="0.6" className="animate-ping" />
            <circle cx="8" cy="40" r="7" fill="#6B7280" opacity="0.4" />
            <circle cx="0" cy="34" r="9" fill="#78350F" opacity="0.3" />
            {/* Cụm bụi đỏ sau bánh xích */}
            <circle cx="20" cy="98" r="4" fill="#B45309" opacity="0.5" />
            <circle cx="10" cy="96" r="6" fill="#92400E" opacity="0.4" />
          </g>
        )}

        {/* CỘT CỜ VÀ LÁ CỜ MẶT TRẬN DÂN TỘC GIẢI PHÓNG MIỀN NAM VIỆT NAM */}
        <g transform="translate(68, 6)">
          {/* Cán cờ thép */}
          <line x1="0" y1="0" x2="0" y2="34" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
          {/* Nắp cán cờ bằng đồng thau */}
          <circle cx="0" cy="0" r="2" fill="#FBBF24" />

          {/* Lá cờ giải phóng tung bay (Nửa đỏ trên, nửa xanh lam dưới, ngôi sao vàng ở giữa) */}
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
          {/* Nòng pháo dài kiên cố */}
          <rect x="110" y="45.5" width="80" height="4" fill="#2E3D30" stroke="#1F2937" strokeWidth="0.5" />
          {/* Bọc bọng khói giữa nòng */}
          <rect x="148" y="44.5" width="12" height="6" rx="1" fill="#3E4F40" />
        </g>

        {/* THÂN XE TĂNG (HULL) */}
        <g>
          {/* Thùng nhiên liệu phụ tròn phía đuôi xe */}
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
          {/* Vòm tháp pháo đúc nguyên khối */}
          <ellipse
            cx="98"
            cy="47"
            rx="32"
            ry="16"
            fill={`url(#turretGrad-${tankNumber})`}
            stroke="#1E2B20"
            strokeWidth="1.5"
          />

          {/* Cửa vòm chỉ huy & kính tiềm vọng */}
          <ellipse cx="80" cy="38" rx="8" ry="4" fill="#2E3E31" stroke="#162217" strokeWidth="1" />
          <rect x="78" y="34" width="5" height="4" rx="1" fill="#4B5563" />

          {/* Đèn hồng ngoại tác chiến đêm */}
          <circle cx="118" cy="42" r="3.5" fill="#1F2937" stroke="#9CA3AF" strokeWidth="0.5" />
          <circle cx="118" cy="42" r="2" fill="#E5E7EB" />

          {/* SỐ HIỆU XE TĂNG LỊCH SỬ (390, 843...) IN RÕ TRÊN THÁP PHÁO */}
          <rect x="85" y="44" width="26" height="11" rx="2" fill="#000000" opacity="0.45" />
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

          {/* Dải ruy băng nhận diện màu sắc cánh quân */}
          <rect x="70" y="52" width="56" height="3" fill={color} opacity="0.9" rx="1" />
        </g>

        {/* DẢI XÍCH VÀ CÁC BÁNH CHỊU LỰC (KHÔNG XOAY TRÒN - GIỮ VỮNG TÍNH CHẮC CHẮN NẶNG NỀ) */}
        <g>
          {/* Khung dải xích thép */}
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

          {/* 5 BÁNH CHỊU LỰC T-54 (CỐ ĐỊNH, KHÔNG XOAY TRÒN GÂY CHÓNG MẶT) */}
          {[48, 73, 98, 123, 148].map((cx, idx) => (
            <g key={idx}>
              {/* Vành lốp cao su đúc */}
              <circle cx={cx} cy="89" r="10.5" fill="#1A201C" stroke="#2B382E" strokeWidth="1" />
              {/* Đĩa bánh thép đúc có gờ chịu lực */}
              <circle cx={cx} cy="89" r="8" fill="#3D5040" />
              {/* Trục giữa và ốc siết trung tâm */}
              <circle cx={cx} cy="89" r="4" fill="#253227" stroke="#162018" strokeWidth="1" />
              <circle cx={cx} cy="89" r="1.5" fill="#D1D5DB" />
              {/* Lỗ tản nhiệt đĩa bánh đặc trưng T-54 */}
              <circle cx={cx} cy="84" r="1.2" fill="#151C16" />
              <circle cx={cx} cy="94" r="1.2" fill="#151C16" />
              <circle cx={cx - 5} cy="89" r="1.2" fill="#151C16" />
              <circle cx={cx + 5} cy="89" r="1.2" fill="#151C16" />
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
