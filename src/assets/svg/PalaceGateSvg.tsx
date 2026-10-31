import React from 'react';

interface PalaceGateSvgProps {
  isOpen?: boolean;
  winningTeamName?: string;
  className?: string;
}

export const PalaceGateSvg: React.FC<PalaceGateSvgProps> = ({
  isOpen = false,
  winningTeamName = 'Đội Chiến Thắng',
  className = 'w-36 h-28',
}) => {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Hiệu ứng hào quang chiến thắng khi cổng mở */}
      {isOpen && (
        <div className="absolute -inset-4 bg-gradient-to-t from-amber-500/30 via-red-500/20 to-transparent rounded-2xl blur-lg animate-pulse pointer-events-none" />
      )}

      {/* Biển vinh danh trên đỉnh cổng khi cắm cờ */}
      {isOpen && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap bg-gradient-to-r from-vietnam-red via-amber-500 to-vietnam-red text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-lg border border-yellow-300 animate-bounce">
          ★ {winningTeamName} CẮM CỜ ★
        </div>
      )}

      <svg
        viewBox="0 0 160 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg overflow-visible"
      >
        <defs>
          {/* Gradient trụ cổng đá hoa cương */}
          <linearGradient id="pillarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>

          {/* Gradient cánh cổng sắt đúc */}
          <linearGradient id="gateIronGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D3748" />
            <stop offset="50%" stopColor="#1A202C" />
            <stop offset="100%" stopColor="#171923" />
          </linearGradient>
        </defs>

        {/* LÁ CỜ GIẢI PHÓNG TRÊN ĐỈNH DINH ĐỘC LẬP */}
        <g transform="translate(80, 8)">
          {/* Cột cờ trung tâm */}
          <line x1="0" y1="0" x2="0" y2="28" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="0" cy="0" r="2.5" fill="#F59E0B" />

          {/* Lá cờ giải phóng (Nửa đỏ, nửa xanh, sao vàng) */}
          <g className={`origin-left transition-all duration-700 ${isOpen ? 'scale-125 animate-[wiggle_1.2s_ease-in-out_infinite]' : 'opacity-80'}`}>
            <path d="M 0,0 Q 14,-2 28,0 L 28,10 Q 14,8 0,10 Z" fill="#DA251D" />
            <path d="M 0,10 Q 14,8 28,10 L 28,20 Q 14,18 0,20 Z" fill="#0072CE" />
            <polygon
              points="14,6 15.5,9.5 19,9.5 16.5,11.5 17.5,15 14,13 10.5,15 11.5,11.5 9,9.5 12.5,9.5"
              fill="#FFFF00"
              stroke="#DA251D"
              strokeWidth="0.3"
            />
          </g>
        </g>

        {/* VÒM HOA SẮT NGHỆ THUẬT NỐI 2 TRỤ CỔNG */}
        <path
          d="M 28,38 Q 80,18 132,38"
          stroke="#4A5568"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 32,44 Q 80,26 128,44"
          stroke="#D97706"
          strokeWidth="1.5"
          fill="none"
        />

        {/* BIỂU TƯỢNG HOA VĂN QUỐC HUY TRUNG TÂM VÒM CỔNG */}
        <circle cx="80" cy="31" r="7" fill="#B45309" stroke="#FBBF24" strokeWidth="1.5" />
        <polygon
          points="80,26 81.5,29.5 85,29.5 82.5,31.5 83.5,35 80,33 76.5,35 77.5,31.5 75,29.5 78.5,29.5"
          fill="#FFFF00"
        />

        {/* HAI TRỤ CỔNG ĐÁ TRẮNG DINH ĐỘC LẬP */}
        {/* Trụ cổng trái */}
        <g>
          {/* Chóp đỉnh đèn tròn */}
          <circle cx="28" cy="30" r="4.5" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1" />
          <rect x="23" y="34" width="10" height="4" fill="#D1D5DB" />
          {/* Thân cột */}
          <rect x="22" y="38" width="12" height="82" fill="url(#pillarGrad)" stroke="#9CA3AF" strokeWidth="1.5" />
          {/* Rãnh hoa văn dọc thân cột */}
          <line x1="26" y1="42" x2="26" y2="116" stroke="#E5E7EB" strokeWidth="1" />
          <line x1="30" y1="42" x2="30" y2="116" stroke="#9CA3AF" strokeWidth="1" />
          {/* Bệ chân cột */}
          <rect x="18" y="118" width="20" height="8" rx="1" fill="#4B5563" stroke="#374151" strokeWidth="1" />
        </g>

        {/* Trụ cổng phải */}
        <g>
          {/* Chóp đỉnh đèn tròn */}
          <circle cx="132" cy="30" r="4.5" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1" />
          <rect x="127" y="34" width="10" height="4" fill="#D1D5DB" />
          {/* Thân cột */}
          <rect x="126" y="38" width="12" height="82" fill="url(#pillarGrad)" stroke="#9CA3AF" strokeWidth="1.5" />
          {/* Rãnh hoa văn dọc thân cột */}
          <line x1="130" y1="42" x2="130" y2="116" stroke="#E5E7EB" strokeWidth="1" />
          <line x1="134" y1="42" x2="134" y2="116" stroke="#9CA3AF" strokeWidth="1" />
          {/* Bệ chân cột */}
          <rect x="122" y="118" width="20" height="8" rx="1" fill="#4B5563" stroke="#374151" strokeWidth="1" />
        </g>

        {/* CÁNH CỔNG SẮT LỊCH SỬ (ANIMATION BẬT TUNG KHI CẮM CỜ 100%) */}
        {/* Cánh cổng bên trái */}
        <g
          className="transition-transform duration-1000 ease-out origin-[34px_80px]"
          style={{
            transform: isOpen ? 'rotateY(-85deg) scaleX(0.2) skewY(-8deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Khung viền cánh trái */}
          <rect x="34" y="44" width="46" height="74" fill="none" stroke="#2D3748" strokeWidth="2.5" />
          {/* Hoa sắt hoa văn vòm */}
          <path d="M 34,44 Q 57,36 80,44" fill="none" stroke="#4A5568" strokeWidth="2" />
          {/* Các thanh song sắt đứng dọc */}
          {[42, 50, 58, 66, 74].map((x) => (
            <line key={x} x1={x} y1="42" x2={x} y2="118" stroke="#4A5568" strokeWidth="1.8" />
          ))}
          {/* Các thanh giằng ngang */}
          <line x1="34" y1="70" x2="80" y2="70" stroke="#718096" strokeWidth="2" />
          <line x1="34" y1="95" x2="80" y2="95" stroke="#718096" strokeWidth="2" />
          {/* Họa tiết mũi giáo đỉnh song sắt */}
          {[42, 50, 58, 66, 74].map((x) => (
            <polygon key={`arrow-${x}`} points={`${x},38 ${x - 2},42 ${x + 2},42`} fill="#F59E0B" />
          ))}
        </g>

        {/* Cánh cổng bên phải */}
        <g
          className="transition-transform duration-1000 ease-out origin-[126px_80px]"
          style={{
            transform: isOpen ? 'rotateY(85deg) scaleX(0.2) skewY(8deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Khung viền cánh phải */}
          <rect x="80" y="44" width="46" height="74" fill="none" stroke="#2D3748" strokeWidth="2.5" />
          {/* Hoa sắt hoa văn vòm */}
          <path d="M 80,44 Q 103,36 126,44" fill="none" stroke="#4A5568" strokeWidth="2" />
          {/* Các thanh song sắt đứng dọc */}
          {[86, 94, 102, 110, 118].map((x) => (
            <line key={x} x1={x} y1="42" x2={x} y2="118" stroke="#4A5568" strokeWidth="1.8" />
          ))}
          {/* Các thanh giằng ngang */}
          <line x1="80" y1="70" x2="126" y2="70" stroke="#718096" strokeWidth="2" />
          <line x1="80" y1="95" x2="126" y2="95" stroke="#718096" strokeWidth="2" />
          {/* Họa tiết mũi giáo đỉnh song sắt */}
          {[86, 94, 102, 110, 118].map((x) => (
            <polygon key={`arrow-${x}`} points={`${x},38 ${x - 2},42 ${x + 2},42`} fill="#F59E0B" />
          ))}
        </g>

        {/* Mặt đường và vạch đích đỏ 100% */}
        <line x1="10" y1="126" x2="150" y2="126" stroke="#991B1B" strokeWidth="4" />
        <line x1="10" y1="128" x2="150" y2="128" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="6 3" />
      </svg>
    </div>
  );
};
