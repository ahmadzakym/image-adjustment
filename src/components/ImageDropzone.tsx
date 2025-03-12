
import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

interface ImageDropzoneProps {
  onImageSelected: (imageFile: File) => void;
  className?: string;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImageSelected, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [onImageSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [onImageSelected]);

  const handleFiles = (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const fileType = file.type;
      
      if (!fileType.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      onImageSelected(file);
      toast.success('Image uploaded successfully');
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={cn(
        'relative w-full transition-all duration-300 ease-spring',
        className
      )}
    >
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center w-full p-6 rounded-xl border-2 border-dashed transition-all duration-300',
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.01]' 
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50',
          preview ? 'bg-muted/20' : '',
          'cursor-pointer group animate-fade-in'
        )}
      >
        {preview ? (
          <div className="relative w-full">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-64 rounded-lg object-contain mx-auto animate-fade-in" 
            />
            <button 
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-destructive hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Click to change image
            </p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-medium mb-1">Drop your image here</h3>
            <p className="text-sm text-muted-foreground">
              or click to browse (JPG, PNG)
            </p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

export default ImageDropzone;
