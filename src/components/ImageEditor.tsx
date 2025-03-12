
import React, { useState, useEffect, useRef } from 'react';
import { AdjustmentValues } from './ControlPanel';
import ControlPanel from './ControlPanel';
import ImageDropzone from './ImageDropzone';
import { loadOpenCV, processImage, downloadImage } from '@/utils/imageProcessing';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_ADJUSTMENTS: AdjustmentValues = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
};

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<AdjustmentValues>(DEFAULT_ADJUSTMENTS);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpenCVLoaded, setIsOpenCVLoaded] = useState(false);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load OpenCV when component mounts
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
  const handleAdjustmentChange = (type: keyof AdjustmentValues, value: number) => {
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
  
  // Download the processed image
  const handleDownload = () => {
    if (processedImageUrl) {
      downloadImage(processedImageUrl, "edited-image.jpg");
      toast.success("Image downloaded");
    } else {
      toast.error("No image to download");
    }
  };
  
  // Toggle between showing the original and processed image
  const handleToggleOriginal = () => {
    setShowOriginal(!showOriginal);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="mb-6">
            <ImageDropzone onImageSelected={handleImageSelected} />
          </div>
          
          <div className="relative rounded-xl overflow-hidden glass-card min-h-[300px] flex items-center justify-center">
            {isProcessing && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            
            {!originalImage && !processedImageUrl && (
              <div className="text-center p-8">
                <p className="text-muted-foreground">
                  Upload an image to start editing
                </p>
              </div>
            )}
            
            {originalImage && !showOriginal && processedImageUrl && (
              <img 
                src={processedImageUrl} 
                alt="Processed" 
                className="max-w-full max-h-[60vh] object-contain animate-fade-in" 
              />
            )}
            
            {originalImage && showOriginal && (
              <img 
                src={originalImage.src} 
                alt="Original" 
                className="max-w-full max-h-[60vh] object-contain animate-fade-in" 
              />
            )}
          </div>
          
          {originalImage && processedImageUrl && (
            <div className="flex justify-center mt-4 space-x-2">
              <Tabs defaultValue="split" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="edited">Edited</TabsTrigger>
                  <TabsTrigger value="split">Split View</TabsTrigger>
                  <TabsTrigger value="original">Original</TabsTrigger>
                </TabsList>
                <TabsContent value="edited" className="pt-4 animate-fade-in">
                  <img 
                    src={processedImageUrl} 
                    alt="Processed" 
                    className="max-w-full max-h-[40vh] object-contain mx-auto rounded-lg" 
                  />
                </TabsContent>
                <TabsContent value="split" className="pt-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="flex-1 relative">
                      <img 
                        src={originalImage.src} 
                        alt="Original" 
                        className="w-full rounded-lg" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-lg">
                        <p className="text-white font-medium text-sm">Original</p>
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-24 hidden sm:block" />
                    <Separator orientation="horizontal" className="w-24 sm:hidden" />
                    <div className="flex-1 relative">
                      <img 
                        src={processedImageUrl} 
                        alt="Processed" 
                        className="w-full rounded-lg" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-lg">
                        <p className="text-white font-medium text-sm">Edited</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="original" className="pt-4 animate-fade-in">
                  <img 
                    src={originalImage.src} 
                    alt="Original" 
                    className="max-w-full max-h-[40vh] object-contain mx-auto rounded-lg" 
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
        
        <div className={cn(
          "transition-opacity duration-300",
          originalImage ? "opacity-100" : "opacity-50 pointer-events-none"
        )}>
          <ControlPanel
            adjustments={adjustments}
            onAdjustmentChange={handleAdjustmentChange}
            onReset={handleReset}
            onDownload={handleDownload}
            showOriginal={showOriginal}
            onToggleOriginal={handleToggleOriginal}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
