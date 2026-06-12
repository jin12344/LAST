'use client';

import { useState } from 'react';
import type { Location } from '@/types';

interface LocationGroupProps {
  location: Location;
  onRename: (locationId: string, newName: string) => void;
}

const NO_LOCATION_ID = 'no-location';

export default function LocationGroup({ location, onRename }: LocationGroupProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(location.name);

  const canRename = location.id !== NO_LOCATION_ID;

  function handleSave() {
    setEditing(false);

    const trimmed = name.trim();
    if (trimmed && trimmed !== location.name) {
      onRename(location.id, trimmed);
    } else {
      setName(location.name);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setName(location.name);
                setEditing(false);
              }
            }}
            className="rounded border border-blue-400 px-2 py-1 text-base font-semibold focus:outline-none"
          />
        ) : (
          <h3
            onClick={() => canRename && setEditing(true)}
            className={`text-base font-semibold ${canRename ? 'cursor-pointer hover:underline' : ''}`}
            title={canRename ? '클릭해서 장소명 수정' : undefined}
          >
            {location.name}
          </h3>
        )}

        <span className="flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {location.photos.length}장
        </span>
      </div>

      <ul className="space-y-1">
        {location.photos.map((photo) => (
          <li key={photo.id} className="flex justify-between text-sm text-gray-600">
            <span className="truncate">{photo.filename}</span>
            {!isNaN(photo.lat) && !isNaN(photo.lng) && (
              <span className="ml-2 flex-shrink-0 text-gray-400">
                {photo.lat.toFixed(5)}, {photo.lng.toFixed(5)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
