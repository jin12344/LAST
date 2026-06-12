'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { extractGPS } from '@/lib/exif';
import type { Photo } from '@/types';

const MAX_PHOTOS = 100;

interface UploadAreaProps {
  existingFilenames: string[];
  onProcessed: (photos: Photo[]) => void;
}

export default function UploadArea({ existingFilenames, onProcessed }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setMessage(null);

    const existing = new Set(existingFilenames);
    const seen = new Set<string>();
    const files: File[] = [];

    for (const file of Array.from(fileList)) {
      if (existing.has(file.name) || seen.has(file.name)) {
        continue;
      }
      seen.add(file.name);
      files.push(file);
    }

    if (files.length === 0) {
      setMessage('새로 추가할 사진이 없습니다 (중복 제외).');
      return;
    }

    const availableSlots = MAX_PHOTOS - existing.size;
    const targetFiles = files.slice(0, Math.max(0, availableSlots));

    if (targetFiles.length === 0) {
      setMessage(`최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
      return;
    }

    if (targetFiles.length < files.length) {
      setMessage(`최대 ${MAX_PHOTOS}장까지만 업로드되어 일부 사진이 제외되었습니다.`);
    }

    setProcessing(true);
    setProgress({ done: 0, total: targetFiles.length });

    const photos: Photo[] = [];

    for (const file of targetFiles) {
      const objectUrl = URL.createObjectURL(file);

      try {
        const gps = await extractGPS(file);

        photos.push({
          id: crypto.randomUUID(),
          filename: file.name,
          lat: gps ? gps.lat : NaN,
          lng: gps ? gps.lng : NaN,
          timestamp: new Date(file.lastModified).toISOString(),
        });
      } catch (error) {
        console.error('UploadArea processFiles error:', error);
      } finally {
        URL.revokeObjectURL(objectUrl);
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }
    }

    setProcessing(false);
    onProcessed(photos);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    processFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
      >
        <p className="text-sm text-gray-600">
          사진을 드래그 & 드롭하거나 클릭해서 선택하세요
        </p>
        <p className="mt-1 text-xs text-gray-400">최대 {MAX_PHOTOS}장</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {processing && (
        <p className="mt-2 text-sm text-gray-600">
          분석 중... {progress.done} / {progress.total}
        </p>
      )}

      {message && <p className="mt-2 text-sm text-amber-600">{message}</p>}
    </div>
  );
}
