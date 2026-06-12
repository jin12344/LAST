'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProject,
  saveProject,
  updateLocation,
  deleteProject,
} from '@/lib/database';
import { groupPhotos } from '@/lib/location';
import Header from '@/components/Header';
import UploadArea from '@/components/UploadArea';
import LocationGroup from '@/components/LocationGroup';
import Modal from '@/components/Modal';
import type { Project, Location, Photo } from '@/types';

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [locations, setLocations] = useState<Record<string, Location>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || !projectId) return;

    let mounted = true;

    async function load() {
      setLoading(true);
      const { project: data, error: loadError } = await getProject(user!.uid, projectId);

      if (!mounted) return;

      if (loadError || !data) {
        setError(loadError || '프로젝트를 찾을 수 없습니다.');
      } else {
        setProject(data);
        setLocations(data.locations);
        setError(null);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user, projectId]);

  function getAllPhotos(): Photo[] {
    return Object.values(locations).flatMap((loc) => loc.photos);
  }

  async function handlePhotosProcessed(newPhotos: Photo[]) {
    if (!user || newPhotos.length === 0) return;

    const allPhotos = [...getAllPhotos(), ...newPhotos];
    const regrouped = groupPhotos(allPhotos);

    const nextLocations: Record<string, Location> = {};
    for (const loc of regrouped) {
      const existing = Object.values(locations).find(
        (l) =>
          l.id === loc.id ||
          (l.name === loc.name && Math.abs(l.lat - loc.lat) < 0.0001 && Math.abs(l.lng - loc.lng) < 0.0001)
      );

      nextLocations[loc.id] = existing ? { ...loc, name: existing.name } : loc;
    }

    setLocations(nextLocations);
    setSaving(true);

    const { error: saveError } = await saveProject(user.uid, projectId, nextLocations);

    setSaving(false);

    if (saveError) {
      setError(saveError);
    }
  }

  async function handleRename(locationId: string, newName: string) {
    if (!user) return;

    setLocations((prev) => ({
      ...prev,
      [locationId]: { ...prev[locationId], name: newName },
    }));

    const { error: updateError } = await updateLocation(user.uid, projectId, locationId, newName);

    if (updateError) {
      setError(updateError);
    }
  }

  async function handleDelete() {
    if (!user) return;

    setDeleting(true);
    const { error: deleteError } = await deleteProject(user.uid, projectId);
    setDeleting(false);

    if (deleteError) {
      setError(deleteError);
      setShowDeleteModal(false);
      return;
    }

    router.push('/projects');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const sortedLocations = Object.values(locations).sort((a, b) => {
    if (a.id === 'no-location') return 1;
    if (b.id === 'no-location') return -1;
    return b.photos.length - a.photos.length;
  });

  return (
    <div>
      <Header title={project?.projectName || '프로젝트'} />

      <main className="space-y-6 p-4 sm:p-6">
        <div>
          <UploadArea
            existingFilenames={getAllPhotos().map((p) => p.filename)}
            onProcessed={handlePhotosProcessed}
          />
          {saving && <p className="mt-2 text-sm text-gray-500">저장 중...</p>}
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {sortedLocations.length === 0 ? (
          <p className="text-gray-500">아직 업로드된 사진이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedLocations.map((location) => (
              <LocationGroup key={location.id} location={location} onRename={handleRename} />
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            프로젝트 삭제
          </button>
        </div>
      </main>

      {showDeleteModal && (
        <Modal title="프로젝트 삭제" onClose={() => setShowDeleteModal(false)}>
          <p className="mb-4 text-sm text-gray-600">
            정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
