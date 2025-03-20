import React from "react";
import ControlPanel from "./ControlPanel";
import ImageDropzone from "./ImageDropzone";
import ImageDisplay from "./editor/ImageDisplay.tsx";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import { downloadImage } from "@/utils/imageProcessing";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ImageEditor: React.FC = () => {
  const {
    originalImage,
    processedImageUrl,
    adjustments,
    showOriginal,
    isProcessing,
    handleImageSelected,
    handleAdjustmentChange,
    handleReset,
    handleToggleOriginal,
  } = useImageProcessor();

  // Download the processed image
  const handleDownload = () => {
    if (processedImageUrl) {
      downloadImage(processedImageUrl, "edited-image.jpg");
      toast.success("Image downloaded");
    } else {
      toast.error("No image to download");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="mb-6">
            <ImageDropzone onImageSelected={handleImageSelected} />
          </div>

          <ImageDisplay
            originalImage={originalImage}
            processedImageUrl={processedImageUrl}
            showOriginal={showOriginal}
            isProcessing={isProcessing}
          />
        </div>

        <div
          className={cn(
            "transition-opacity duration-300",
            originalImage ? "opacity-100" : "opacity-50 pointer-events-none"
          )}
        >
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
