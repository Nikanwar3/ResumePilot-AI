import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

export function generateResumeSlug(name: string, title: string): string {
  const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20);
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20);
  const unique = nanoid();
  return `${nameSlug}-${titleSlug}-${unique}`;
}

export function generateUniqueId(): string {
  return nanoid();
}
