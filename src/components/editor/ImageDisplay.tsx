import React from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ImageDisplayProps {
  originalImage: HTMLImageElement | null;
  processedImageUrl: string | null;
  showOriginal: boolean;
  isProcessing: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  originalImage,
  processedImageUrl,
  showOriginal,
  isProcessing,
}) => {
  return (
    <>
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
        <ImageComparisonView
          originalImage={originalImage}
          processedImageUrl={processedImageUrl}
        />
      )}
    </>
  );
};

// Subcomponent for comparison view
const ImageComparisonView: React.FC<{
  originalImage: HTMLImageElement;
  processedImageUrl: string;
}> = ({ originalImage, processedImageUrl }) => {
  return (
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
            <Separator
              orientation="vertical"
              className="h-24 hidden sm:block"
            />
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
  );
};

export default ImageDisplay;
