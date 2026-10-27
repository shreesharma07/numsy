import './Logo.css';

/**
 * The Numsy app icon: tri-colour geometric "N" on a rounded tile (rx 112 on 512, as
 * assets/brand/numsy-app-icon.svg). Tile colour follows the theme (--tile). On mount the N
 * plays the stretch in Logo.css; reduced motion turns it off.
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className ? `logo-mark ${className}` : 'logo-mark'}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="logo-mark__tile" width="512" height="512" rx="112" />
      <path
        className="logo-mark__left"
        fill="#FF4D6D"
        d="M122.88,216.85 A93.97,93.97 0 0 1 216.85,122.88 L216.85,389.12 L122.88,389.12 Z"
      />
      <path
        className="logo-mark__diag"
        fill="#8338EC"
        d="M216.85,122.88 L295.15,243.86 L295.15,389.12 L216.85,268.14 Z"
      />
      <path
        className="logo-mark__right"
        fill="#FFB703"
        d="M295.15,122.88 L389.12,122.88 L389.12,295.15 A93.97,93.97 0 0 1 295.15,389.12 Z"
      />
    </svg>
  );
}

/** Custom geometric "NUMSY" wordmark, drawn as paths (no font dependency). Uses currentColor. */
export function Wordmark({ height = 18, className }: { height?: number; className?: string }) {
  return (
    <svg
      className={className ? `logo-wordmark ${className}` : 'logo-wordmark'}
      height={height}
      width={(height * 247.2) / 60}
      viewBox="153.6 30 247.2 60"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M153.6,30 L166.8,30 L166.8,90 L153.6,90 Z M182.4,30 L195.6,30 L195.6,90 L182.4,90 Z M166.8,30 L182.4,62.52 L182.4,90 L166.8,57.48 Z M202.8,30 L216,30 L216,70.2 A6.6,6.6 0 0 0 229.2,70.2 L229.2,30 L242.4,30 L242.4,70.2 A19.8,19.8 0 0 1 202.8,70.2 Z M249.6,90 L249.6,30 L264.6,30 L277.2,60 L289.8,30 L304.8,30 L304.8,90 L291.6,90 L291.6,54 L282.6,79.2 L271.8,79.2 L262.8,54 L262.8,90 Z M350.4,30 L330.3,30 A18.3,18.3 0 0 0 330.3,66.6 L332.1,66.6 A5.1,5.1 0 0 1 332.1,76.8 L312,76.8 L312,90 L332.1,90 A18.3,18.3 0 0 0 332.1,53.4 L330.3,53.4 A5.1,5.1 0 0 1 330.3,43.2 L350.4,43.2 Z M357.6,30 L372,30 L379.2,50.4 L386.4,30 L400.8,30 L385.8,64.8 L385.8,90 L372.6,90 L372.6,64.8 Z"
      />
    </svg>
  );
}
