import { ref, set, get, remove, push } from 'firebase/database';
import { db } from './firebase';
import type { Project, Location } from '@/types';

export async function createProject(
  userId: string,
  projectName: string
): Promise<{ projectId: string | null; error: string | null }> {
  try {
    const projectsRef = ref(db, `users/${userId}/projects`);
    const newProjectRef = push(projectsRef);
    const projectId = newProjectRef.key;

    if (!projectId) {
      return { projectId: null, error: '프로젝트 ID 생성에 실패했습니다.' };
    }

    const project: Omit<Project, 'id'> = {
      projectName,
      createdAt: new Date().toISOString(),
      locations: {},
    };

    await set(newProjectRef, project);

    return { projectId, error: null };
  } catch (error) {
    console.error('createProject error:', error);
    return { projectId: null, error: '서버 오류. 다시 시도하세요.' };
  }
}

export async function saveProject(
  userId: string,
  projectId: string,
  locations: Record<string, Location>
): Promise<{ error: string | null }> {
  try {
    const locationsRef = ref(db, `users/${userId}/projects/${projectId}/locations`);
    await set(locationsRef, locations);
    return { error: null };
  } catch (error) {
    console.error('saveProject error:', error);
    return { error: '서버 오류. 다시 시도하세요.' };
  }
}

export async function getProject(
  userId: string,
  projectId: string
): Promise<{ project: Project | null; error: string | null }> {
  try {
    const projectRef = ref(db, `users/${userId}/projects/${projectId}`);
    const snapshot = await get(projectRef);

    if (!snapshot.exists()) {
      return { project: null, error: '프로젝트를 찾을 수 없습니다.' };
    }

    const data = snapshot.val();
    return {
      project: {
        id: projectId,
        projectName: data.projectName,
        createdAt: data.createdAt,
        locations: data.locations || {},
      },
      error: null,
    };
  } catch (error) {
    console.error('getProject error:', error);
    return { project: null, error: '서버 오류. 다시 시도하세요.' };
  }
}

export async function updateLocation(
  userId: string,
  projectId: string,
  locationId: string,
  newName: string
): Promise<{ error: string | null }> {
  try {
    const nameRef = ref(
      db,
      `users/${userId}/projects/${projectId}/locations/${locationId}/name`
    );
    await set(nameRef, newName);
    return { error: null };
  } catch (error) {
    console.error('updateLocation error:', error);
    return { error: '서버 오류. 다시 시도하세요.' };
  }
}

export async function deleteProject(
  userId: string,
  projectId: string
): Promise<{ error: string | null }> {
  try {
    const projectRef = ref(db, `users/${userId}/projects/${projectId}`);
    await remove(projectRef);
    return { error: null };
  } catch (error) {
    console.error('deleteProject error:', error);
    return { error: '서버 오류. 다시 시도하세요.' };
  }
}

export async function getUserProjects(
  userId: string
): Promise<{ projects: Project[]; error: string | null }> {
  try {
    const projectsRef = ref(db, `users/${userId}/projects`);
    const snapshot = await get(projectsRef);

    if (!snapshot.exists()) {
      return { projects: [], error: null };
    }

    const data = snapshot.val();
    const projects: Project[] = Object.keys(data).map((id) => ({
      id,
      projectName: data[id].projectName,
      createdAt: data[id].createdAt,
      locations: data[id].locations || {},
    }));

    projects.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { projects, error: null };
  } catch (error) {
    console.error('getUserProjects error:', error);
    return { projects: [], error: '서버 오류. 다시 시도하세요.' };
  }
}

export function generateLocationId(userId: string, projectId: string): string {
  const locationsRef = ref(db, `users/${userId}/projects/${projectId}/locations`);
  const newRef = push(locationsRef);
  return newRef.key || crypto.randomUUID();
}
