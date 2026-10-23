import { faq } from '../../content/faq';
import { RichText } from '../ui';
import './FaqList.css';

export function FaqList({ limit }: { limit?: number }) {
  const items = limit ? faq.slice(0, limit) : faq;
  return (
    <div className="faq">
      {items.map((item, i) => (
        <details key={item.q} open={i === 0}>
          <summary>{item.q}</summary>
          <div className="faq__answer">
            <p>
              <RichText text={item.a} />
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
