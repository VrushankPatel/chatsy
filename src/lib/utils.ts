import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateUsername = () => {
  const adjectives = ['Swift', 'Bright', 'Cosmic', 'Digital', 'Electric', 'Quantum', 'Solar', 'Stellar', 'Cyber', 'Tech'];
  const nouns = ['Phoenix', 'Dragon', 'Nexus', 'Pulse', 'Wave', 'Storm', 'Star', 'Nova', 'Byte', 'Core'];
  const nanoid = customAlphabet('1234567890', 4);
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = nanoid();
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getFileTypeIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️';
    case 'mp3':
    case 'wav':
      return '🎵';
    case 'mp4':
    case 'mov':
      return '🎥';
    default:
      return '📁';
  }
};