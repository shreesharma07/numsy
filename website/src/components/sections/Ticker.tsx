import { tickerLines } from '../../content/home';
import ScrollVelocity from '../reactbits/ScrollVelocity/ScrollVelocity';
import './Ticker.css';

/** Poster ticker band (React Bits ScrollVelocity). Static under prefers-reduced-motion. */
export function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <ScrollVelocity
        texts={tickerLines}
        velocity={40}
        numCopies={4}
        className="ticker__text"
        parallaxClassName="ticker__row"
        scrollerClassName="ticker__scroller"
        outlineAlternate
        gap={32}
      />
    </div>
  );
}
