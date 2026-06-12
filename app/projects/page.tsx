'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProjects, createProject } from '@/lib/database';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    async function load() {
      setLoading(true);
      const { projects: data, error: loadError } = await getUserProjects(user!.uid);

      if (!mounted) return;

      if (loadError) {
        setError(loadError);
      } else {
        setProjects(data);
        setError(null);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    const trimmed = newProjectName.trim();
    if (!trimmed) {
      setModalError('프로젝트명을 입력하세요.');
      return;
    }

    setCreating(true);
    setModalError(null);

    const { projectId, error: createError } = await createProject(user.uid, trimmed);

    setCreating(false);

    if (createError || !projectId) {
      setModalError(createError || '프로젝트 생성에 실패했습니다.');
      return;
    }

    setShowModal(false);
    setNewProjectName('');
    router.push(`/projects/${projectId}`);
  }

  return (
    <div>
      <Header title="프로젝트" />

      <main className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">내 프로젝트</h2>
          <button
            onClick={() => setShowModal(true)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + 새 프로젝트
          </button>
        </div>

        {loading && <p className="text-gray-500">불러오는 중...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <p className="text-gray-500">아직 프로젝트가 없습니다. 새 프로젝트를 만들어보세요.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow-md"
            >
              <h3 className="truncate text-base font-semibold">{project.projectName}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(project.createdAt).toLocaleString('ko-KR')}
              </p>
            </button>
          ))}
        </div>
      </main>

      {showModal && (
        <Modal title="새 프로젝트" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="projectName" className="mb-1 block text-sm font-medium">
                프로젝트명
              </label>
              <input
                id="projectName"
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="예: 일본 여행"
              />
            </div>

            {modalError && <p className="text-sm text-red-600">{modalError}</p>}

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? '생성 중...' : '생성'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
