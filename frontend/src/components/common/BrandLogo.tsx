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
  const iconSize = Math.round(size * 0.58);

  return (
    <div
      className={`brand-logo ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Premium Tech Brandmark Icon */}
      <div
        className="brand-logo__mark"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.28)}px`,
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #06B6D4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.38), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          position: 'relative',
          flexShrink: 0,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hexagonal Ascending Pathway: Modern stylized 'H' + velocity chevron */}
          <path
            d="M5 4.5V19.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M5 12H13"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M13 19.5V8.5L19 4.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 4.5H19V8.5"
            stroke="#67E8F9"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Precision AI Spark Radar Node */}
          <circle cx="19" cy="4.5" r="2" fill="white" />
        </svg>
      </div>

      {showText && (
        <div className="brand-logo__text" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            className="brand-logo__title"
            style={{
              fontSize: `${Math.max(size * 0.48, 17)}px`,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                background: 'var(--brand-title-grad)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}
            >
              HireTrack
            </span>
            <span
              style={{
                fontSize: `${Math.max(size * 0.26, 10)}px`,
                padding: '1.5px 6px',
                borderRadius: '6px',
                background: 'var(--color-primary-bg)',
                border: '1px solid var(--color-primary-border)',
                color: 'var(--color-primary-text)',
                fontWeight: 800,
                letterSpacing: '0.06em',
                lineHeight: 1.2,
              }}
            >
              AI
            </span>
          </div>

          {showSubtitle && (
            <div
              className="brand-logo__subtitle"
              style={{
                fontSize: `${Math.max(size * 0.25, 10)}px`,
                color: 'var(--text-muted)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '2px',
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
