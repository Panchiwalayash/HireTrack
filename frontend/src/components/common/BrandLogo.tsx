import React from 'react';

interface BrandLogoProps {
  size?: number;
  showSubtitle?: boolean;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  showSubtitle = true,
  showText = true,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`brand-logo ${className}`}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <div
        className="brand-logo__mark"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.3)}px`,
          background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <svg
          width={Math.round(size * 0.6)}
          height={Math.round(size * 0.6)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Futuristic Career Radar & AI Compass Spark */}
          <path
            d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
            fill="white"
            fillOpacity="0.95"
          />
          <circle cx="12" cy="12" r="3" fill="#6366F1" />
          <circle cx="12" cy="12" r="1.5" fill="white" />
        </svg>
      </div>

      {showText && (
        <div className="brand-logo__text" style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: `${Math.max(size * 0.46, 16)}px`,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E7FF 60%, #A5B4FC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>HireTrack</span>
          <span
            style={{
              fontSize: `${Math.max(size * 0.28, 10)}px`,
              padding: '1px 6px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.25))',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#818CF8',
              WebkitTextFillColor: '#818CF8',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            AI
          </span>
        </div>
        {showSubtitle && (
          <div
            style={{
              fontSize: `${Math.max(size * 0.26, 10)}px`,
              color: 'var(--text-muted, #94A3B8)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '1px',
            }}
          >
            Career Command OS
          </div>
        )}
      </div>
      )}
    </div>
  );
};
