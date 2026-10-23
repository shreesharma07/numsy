import { type DragEvent, useId, useRef, useState } from 'react';
import { Button, Icon } from '../components/ui';
import { ACCEPT, checkFile } from './runtime';

interface DropZoneProps {
  disabled?: boolean;
  onFile: (file: File) => void;
  onSample: () => void;
}

/**
 * Drag-and-drop or click-to-browse file input for .csv / .xlsx files
 */
export function DropZone({ disabled, onFile, onSample }: DropZoneProps) {
  const inputId = useId();
  const hintId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const take = (file: File | undefined) => {
    if (!file) return;
    const issue = checkFile(file);
    setProblem(issue);
    if (!issue) onFile(file);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setOver(false);
    if (!disabled) take(event.dataTransfer.files[0]);
  };

  return (
    <div className="dropzone">
      <label
        htmlFor={inputId}
        className={['dropzone__target', over && 'is-over', disabled && 'is-disabled']
          .filter(Boolean)
          .join(' ')}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <Icon name="ph:upload-simple-bold" size={28} />
        <span className="dropzone__title">Drop a file or browse</span>
        <span id={hintId} className="dropzone__hint">
          CSV or Excel (.xlsx) · up to 50 MB
        </span>
      </label>
      <input
        ref={input}
        id={inputId}
        className="sr-only"
        type="file"
        accept={ACCEPT}
        disabled={disabled}
        aria-describedby={hintId}
        onChange={(event) => {
          take(event.target.files?.[0]);
          // Allow choosing the same file again
          event.target.value = '';
        }}
      />
      {problem && (
        <p className="dropzone__error" role="alert">
          {problem}
        </p>
      )}
      <Button size="sm" icon="ph:sparkle-bold" onClick={onSample} disabled={disabled}>
        Use sample data
      </Button>
    </div>
  );
}
