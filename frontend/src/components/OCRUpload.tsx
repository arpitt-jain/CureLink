import { useState } from 'react';
import { UploadCloud, FileCheck } from 'lucide-react';
import type { PrescriptionAnalysis } from '../types';
import { buildApiUrl } from '../api';

interface Props {
  onResults: (results: PrescriptionAnalysis) => void;
}

export default function OCRUpload({ onResults }: Props) {
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024;

  const isSupportedFile = (file: File) => {
    if (file.type.startsWith('image/')) return true;
    if (file.type === 'application/pdf') return true;
    return file.name.toLowerCase().endsWith('.pdf');
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadError(null);

    if (!isSupportedFile(file)) {
      setUploadError('Unsupported file type. Please upload a PDF or image file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError('File is too large. Please upload files up to 12MB.');
      return;
    }

    setFileName(file.name);
    setLoading(true);

    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const res = await fetch(buildApiUrl('/api/prescriptions/upload'), {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorPayload.error || 'Upload failed');
      }
      const data = (await res.json()) as PrescriptionAnalysis;
      onResults(data);
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : 'Error uploading prescription.');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-card">
      <div
        className={`upload-zone ${isHovering ? 'drag-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('fileUpload')?.click()}
      >
        <input
          id="fileUpload"
          type="file"
          accept="image/*,.pdf"
          hidden
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
        />

        {loading ? (
          <div className="analyzing-state">
            <div className="spinner-wrap"><div className="spinner-ring" /></div>
            <h4>Analyzing Prescription...</h4>
            <p>Extracting medicine names using OCR</p>
          </div>
        ) : (
          <div>
            <div className="upload-icon-wrapper">
              <UploadCloud size={32} />
            </div>
            <h4>Upload Your Prescription</h4>
            <p>Drag & drop your prescription image here, or click to browse</p>
            <p className="file-types">Supports JPG, PNG, PDF</p>
            {fileName && (
              <div className="uploaded-file-badge">
                <FileCheck size={14} />
                {fileName}
              </div>
            )}
            {uploadError && (
              <p className="upload-error-text">{uploadError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
