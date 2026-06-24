// ============================================================
// CSVUpload — drag-and-drop CSV loader with glow effect
// ============================================================
import { useRef, useState, useCallback } from 'react';
import { Upload, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CSVUploadProps {
  onLoad: (text: string, filename: string) => void;
  filename?: string;
  status?: 'idle' | 'loaded' | 'error';
  transactionCount?: number;
}

export function CSVUpload({ onLoad, filename, status = 'idle', transactionCount }: CSVUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onLoad(text, file.name);
    };
    reader.readAsText(file);
  }, [onLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
        'flex items-center justify-between gap-4 px-5 py-4',
        dragging
          ? 'border-[#FF6B6B] bg-[#FF6B6B]/10 drag-over'
          : status === 'loaded'
          ? 'border-[#38ef7d]/50 bg-[#38ef7d]/5'
          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8'
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleChange}
      />

      <div className="flex items-center gap-3">
        {status === 'loaded' ? (
          <CheckCircle2 className="w-5 h-5 text-[#38ef7d] flex-shrink-0" />
        ) : (
          <Upload className="w-5 h-5 text-white/60 flex-shrink-0" />
        )}
        <div>
          {status === 'loaded' ? (
            <>
              <p className="text-sm font-semibold text-[#38ef7d]">{filename}</p>
              <p className="text-xs text-white/50">{transactionCount} transactions loaded</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-white/80">Drop transactions.csv here</p>
              <p className="text-xs text-white/40">or click to browse · updates live</p>
            </>
          )}
        </div>
      </div>

      {status === 'loaded' && (
        <button
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Update
        </button>
      )}
    </div>
  );
}
