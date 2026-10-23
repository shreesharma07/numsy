/** Decorative Bauhaus keypad grid (mirrors the social card). */
export function PosterArt({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 404 486"
      role="img"
      aria-label="Poster: coral half-circle, a +91 tile, a triangle and a card reading 98765 01234 valid"
    >
      <defs>
        <clipPath id="poster-c1">
          <rect x="0" y="0" width="196" height="150" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="196" height="150" fill="#8338EC" />
      <circle cx="98" cy="150" r="120" fill="#FF4D6D" clipPath="url(#poster-c1)" />
      <rect x="208" y="0" width="196" height="150" fill="#FFB703" />
      <text
        x="388"
        y="128"
        textAnchor="end"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="92"
        fill="#111111"
      >
        +91
      </text>
      <rect x="0" y="162" width="196" height="150" style={{ fill: 'var(--tile)' }} />
      <path d="M0 312 L196 312 L196 162 Z" fill="#FFB703" />
      <rect x="208" y="162" width="196" height="150" fill="#FF4D6D" />
      <circle cx="306" cy="237" r="54" fill="#111111" />
      <circle cx="306" cy="237" r="19" fill="#FAF6EF" />
      <rect x="0" y="324" width="196" height="162" fill="#FFB703" />
      <path d="M0 324 A150 150 0 0 1 150 474 L0 474 Z" fill="#8338EC" />
      <rect x="208" y="324" width="196" height="162" fill="#8338EC" />
      <text
        x="224"
        y="366"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="700"
        fontSize="19"
        fill="#FAF6EF"
      >
        98765 01234
      </text>
      <rect x="224" y="382" width="164" height="2" fill="#FAF6EF" />
      <text
        x="224"
        y="462"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="700"
        fontSize="15"
        letterSpacing="3"
        fill="#FAF6EF"
      >
        VALID
      </text>
      <circle cx="370" cy="452" r="14" fill="#FFB703" />
    </svg>
  );
}
