
import { useState, useEffect } from 'react';
import { AdjustmentValues, FilterType } from '@/components/ControlPanel';
import { loadOpenCV, processImage } from '@/utils/imageProcessing';
import { toast } from 'sonner';

const DEFAULT_ADJUSTMENTS: AdjustmentValues = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  filter: 'none',
};

export function useImageProcessor() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<AdjustmentValues>(DEFAULT_ADJUSTMENTS);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpenCVLoaded, setIsOpenCVLoaded] = useState(false);
  
  // Load OpenCV when hook is first used
  useEffect(() => {
    const loadCV = async () => {
      try {
        await loadOpenCV();
        setIsOpenCVLoaded(true);
        toast.success("Image processing engine loaded!");
      } catch (error) {
        console.error("Failed to load OpenCV:", error);
        toast.error("Failed to load image processing engine");
      }
    };
    
    loadCV();
  }, []);
  
  // Handle image selection
  const handleImageSelected = (imageFile: File) => {
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      // Reset adjustments when a new image is loaded
      setAdjustments(DEFAULT_ADJUSTMENTS);
      // Process image with default adjustments
      processSelectedImage(img, DEFAULT_ADJUSTMENTS);
    };
    img.src = URL.createObjectURL(imageFile);
  };
  
  // Update adjustment values and reprocess image
  const handleAdjustmentChange = (type: keyof AdjustmentValues, value: number | FilterType) => {
    const newAdjustments = { ...adjustments, [type]: value };
    setAdjustments(newAdjustments);
    
    if (originalImage) {
      processSelectedImage(originalImage, newAdjustments);
    }
  };
  
  // Process the image with OpenCV
  const processSelectedImage = async (
    imageElement: HTMLImageElement,
    adjustmentValues: AdjustmentValues
  ) => {
    if (!isOpenCVLoaded) {
      toast.error("Image processing engine not loaded yet");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const dataUrl = await processImage(imageElement, adjustmentValues);
      setProcessedImageUrl(dataUrl);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Reset adjustments to default
  const handleReset = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    if (originalImage) {
      processSelectedImage(originalImage, DEFAULT_ADJUSTMENTS);
    }
    toast.success("Adjustments reset");
  };
  
  // Toggle between showing the original and processed image
  const handleToggleOriginal = () => {
    setShowOriginal(!showOriginal);
  };
  
  return {
    originalImage,
    processedImageUrl,
    adjustments,
    showOriginal,
    isProcessing,
    handleImageSelected,
    handleAdjustmentChange,
    handleReset,
    handleToggleOriginal,
    DEFAULT_ADJUSTMENTS
  };
}
