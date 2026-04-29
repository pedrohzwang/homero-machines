import { File, Directory, Paths } from 'expo-file-system';

export const APP_STORAGE_DIR = new Directory(Paths.document, 'my-machines');
export const PHOTOS_DIR = new Directory(APP_STORAGE_DIR, 'photos');

function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extractExt(uri: string): string {
  const clean = uri.split('?')[0];
  const lastDot = clean.lastIndexOf('.');
  if (lastDot === -1) return 'jpg';
  const ext = clean.slice(lastDot + 1).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext) ? ext : 'jpg';
}

export async function ensurePhotosDir(): Promise<void> {
  if (!PHOTOS_DIR.exists) {
    PHOTOS_DIR.create({ intermediates: true });
  }
}

export async function savePhoto(sourceUri: string): Promise<string> {
  await ensurePhotosDir();
  const ext = extractExt(sourceUri);
  const fileName = `photo-${uniqueId()}.${ext}`;
  const destFile = new File(PHOTOS_DIR, fileName);
  const sourceFile = new File(sourceUri);
  
  sourceFile.copy(destFile);
  return destFile.uri;
}

export async function deletePhoto(uri: string): Promise<void> {
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

export async function deletePhotos(uris: string[]): Promise<void> {
  uris.forEach(uri => {
    deletePhoto(uri);
  });
}
