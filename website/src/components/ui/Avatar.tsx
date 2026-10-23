import { useState } from 'react';
import './Avatar.css';

export function Avatar({
  src,
  alt,
  name,
  size = 64,
  fluid = false,
  className,
}: {
  src: string;
  alt: string;
  /** Used for the initials fallback when the image fails to load */
  name: string;
  size?: number;
  /** Fill the parent box instead of a fixed size (size still sets the image request) */
  fluid?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/[\s_-]+/)
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={['avatar', fluid && 'avatar--fluid', className].filter(Boolean).join(' ')}
      style={fluid ? undefined : { width: size, height: size }}
    >
      {failed ? (
        <span className="avatar__fallback" role="img" aria-label={alt}>
          {initials}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
