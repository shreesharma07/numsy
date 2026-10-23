/**
 * Synthetic sample data for "Try a sample". Every name and number is generated:
 * no real contact data is bundled with Numsy.
 */

const CITIES = ['Pune', 'Delhi', 'Jaipur', 'Kochi', 'Indore', 'Surat', 'Patna', 'Mysuru'];

/** Small deterministic PRNG so the sample is the same on every load */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const csvCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

/**
 * A CSV with valid, duplicate, invalid, empty and multi-number cells in mixed formats
 */
export function sampleCsv(rows = 1200): string {
  const random = mulberry32(2026);
  const digit = () => Math.floor(random() * 10);
  const mobile = () =>
    `${6 + Math.floor(random() * 4)}${Array.from({ length: 9 }, digit).join('')}`;
  const styles = [
    (n: string) => n,
    (n: string) => `+91 ${n.slice(0, 5)} ${n.slice(5)}`,
    (n: string) => `0${n}`,
    (n: string) => `${n.slice(0, 5)}-${n.slice(5)}`,
    (n: string) => `(+91) ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`,
  ];
  const seen: string[] = [];
  const lines = ['Name,Mobile Number,City'];

  for (let i = 1; i <= rows; i++) {
    const roll = random();
    let cell: string;
    if (roll < 0.15 && seen.length) cell = seen[Math.floor(random() * seen.length)];
    else if (roll < 0.2) cell = ['9999999999', '12345', '5123456789', '98765 4321'][i % 4];
    else if (roll < 0.22) cell = '';
    else if (roll < 0.27) cell = `${mobile()} / ${styles[1](mobile())}`;
    else {
      const n = mobile();
      seen.push(n);
      cell = styles[i % styles.length](n);
    }
    const name = `Contact ${String(i).padStart(4, '0')}`;
    lines.push([name, cell, CITIES[i % CITIES.length]].map(csvCell).join(','));
  }
  return `${lines.join('\n')}\n`;
}

export const SAMPLE_TEXT = [
  'Ravi: +91 98765 01234, Priya 0 91234 56789 / 70123-45678',
  'Leads: 9876543210; 98989 89898 | 5123456789 or 9999999999',
  'Repeat: 919876501234 and (0091) 81234-56780',
  'Typo: 98765 4321',
].join('\n');
