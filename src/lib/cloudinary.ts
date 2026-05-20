'use client';

/**
 * @fileOverview Cloudinary REST API utilities for VoltaRentals.
 * Integrated with master credentials: djpfdthdk / ml_default
 */

export async function uploadToCloudinary(file: File): Promise<string> {
  // Use the verified cloud name provided by the user
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'djpfdthdk';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'voltarentals/fleet');

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudinary terminal error:', data);
      throw new Error(data.error?.message || 'Visual upload protocol failed');
    }

    return data.secure_url;
  } catch (error: any) {
    console.error('Upload catch error:', error);
    throw error;
  }
}

export async function uploadMultipleToCloudinary(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    if (onProgress) onProgress(i + 1, files.length);
    try {
      const url = await uploadToCloudinary(files[i]);
      urls.push(url);
    } catch (err) {
      console.warn("Skipping failed visual upload:", i);
    }
  }
  return urls;
}

export function getOptimizedUrl(url: string, width: number = 800): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}