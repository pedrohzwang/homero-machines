import * as FileSystem from 'expo-file-system';

export const APP_STORAGE_DIR = `${FileSystem.documentDirectory}my-machines/`;
export const PHOTOS_DIR = `${APP_STORAGE_DIR}photos/`;

function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extractExt(uri: string): string {
  // Strip query params, then take extension
  const clean = uri.split('?')[0];
  const lastDot = clean.lastIndexOf('.');
  if (lastDot === -1) return 'jpg';
  const ext = clean.slice(lastDot + 1).toLowerCase();
  // Guard against weird extensions
  return ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext) ? ext : 'jpg';
}

export async function ensurePhotosDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

export async function savePhoto(sourceUri: string): Promise<string> {
  await ensurePhotosDir();
  const ext = extractExt(sourceUri);
  const fileName = `photo-${uniqueId()}.${ext}`;
  const destUri = `${PHOTOS_DIR}${fileName}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

export async function deletePhoto(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

export async function deletePhotos(uris: string[]): Promise<void> {
  await Promise.all(uris.map(deletePhoto));
}
