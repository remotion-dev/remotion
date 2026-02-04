import { useState, useRef, useCallback, type ChangeEvent, type DragEvent, type ClipboardEvent } from "react";
import { fileToBase64 } from "@/helpers/capture-frame";

const MAX_ATTACHED_IMAGES = 4;

interface UseImageAttachmentsReturn {
  attachedImages: string[];
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  addImages: (newImages: string[]) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  handleFileSelect: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handlePaste: (e: ClipboardEvent) => Promise<void>;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent) => Promise<void>;
  canAddMore: boolean;
}

export function useImageAttachments(): UseImageAttachmentsReturn {
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback((newImages: string[]) => {
    setAttachedImages((prev) => {
      const combined = [...prev, ...newImages];
      return combined.slice(0, MAX_ATTACHED_IMAGES);
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => {
    setAttachedImages([]);
  }, []);

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const base64Images = await Promise.all(imageFiles.map(fileToBase64));
    addImages(base64Images);
    // Reset input so same file can be selected again
    e.target.value = "";
  }, [addImages]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));
    if (imageItems.length > 0) {
      e.preventDefault();
      const files = imageItems
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);
      const base64Images = await Promise.all(files.map(fileToBase64));
      addImages(base64Images);
    }
  }, [addImages]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const base64Images = await Promise.all(imageFiles.map(fileToBase64));
    addImages(base64Images);
  }, [addImages]);

  return {
    attachedImages,
    isDragging,
    fileInputRef,
    addImages,
    removeImage,
    clearImages,
    handleFileSelect,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    canAddMore: attachedImages.length < MAX_ATTACHED_IMAGES,
  };
}
