/**
 * Flag of India: 3:2, equal saffron / white / green bands, navy Ashoka Chakra with 24 spokes.
 * Colours follow the Flag Code of India; drawn inline so it renders identically everywhere
 * (flag emoji show as "IN" letters on Windows).
 */

const SPOKES = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);

export function FlagIndia({ width = 24, className }: { width?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={width}
      height={(width * 2) / 3}
      viewBox="0 0 225 150"
      role="img"
      aria-label="Flag of India"
    >
      <rect width="225" height="50" fill="#FF9933" />
      <rect y="50" width="225" height="50" fill="#FFFFFF" />
      <rect y="100" width="225" height="50" fill="#138808" />
      <g transform="translate(112.5 75)" stroke="#000080" fill="none">
        <circle r="20" strokeWidth="3" />
        <circle r="3.5" fill="#000080" stroke="none" />
        {SPOKES.map((angle) => (
          <line key={angle} y2="-20" strokeWidth="1.2" transform={`rotate(${angle})`} />
        ))}
      </g>
    </svg>
  );
}
