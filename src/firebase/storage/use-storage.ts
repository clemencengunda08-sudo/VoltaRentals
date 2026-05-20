'use client';

import { useState } from 'react';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { useStorage } from '../provider';

export function useStorageUpload() {
  const storage = useStorage();
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadCarImage = async (file: File, carId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validations
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        const err = "Invalid file type. Only JPG, PNG, and WebP allowed.";
        setError(err);
        return reject(new Error(err));
      }

      if (file.size > 5 * 1024 * 1024) {
        const err = "File size too large. Max 5MB allowed.";
        setError(err);
        return reject(new Error(err));
      }

      setUploading(true);
      setError(null);
      
      const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `cars/${carId}/${filename}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (err) => {
          setError(err.message);
          setUploading(false);
          reject(err);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          setProgress(0);
          resolve(downloadURL);
        }
      );
    });
  };

  const deleteCarImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const decodedUrl = decodeURIComponent(imageUrl);
      const pathStart = decodedUrl.indexOf('/o/') + 3;
      const pathEnd = decodedUrl.indexOf('?');
      const fullPath = decodedUrl.substring(pathStart, pathEnd);
      
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);
      return true;
    } catch (err: any) {
      console.error('Error deleting file:', err);
      // Return true even if file already deleted to avoid blocking flow
      return true;
    }
  };

  return { 
    uploadCarImage, 
    deleteCarImage, 
    progress, 
    uploading, 
    error 
  };
}
