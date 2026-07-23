import { useEffect, useRef, useState } from 'react';

export default function SignatureUpload({ existingUrl, onUpload, disabled, label = 'Signature' }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(existingUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPreview(existingUrl || null);
  }, [existingUrl]);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-wide font-mono text-ink-soft mb-2">{label}</p>
      <div className="flex items-center gap-4">
        <div className="w-40 h-20 border border-dashed border-paper-line bg-white rounded-sm flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="Signature preview" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-xs text-ink-soft">No signature</span>
          )}
        </div>
        {!disabled && (
          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-sm font-medium text-navy border border-navy rounded-sm px-3 py-1.5 hover:bg-navy hover:text-white transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : preview ? 'Replace signature' : 'Upload signature'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {error && <p className="text-xs text-rust mt-1">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
