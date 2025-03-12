
import { AdjustmentValues } from '@/components/ControlPanel';

// Initialize OpenCV.js
declare global {
  interface Window {
    cv: any;
  }
}

export async function loadOpenCV(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if OpenCV is already loaded
    if (window.cv) {
      resolve();
      return;
    }

    // Create a script element to load OpenCV.js
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.7.0/opencv.js';
    script.async = true;
    script.onload = () => {
      // Poll for OpenCV to be fully loaded
      const checkOpenCV = () => {
        if (window.cv && window.cv.imread) {
          resolve();
        } else {
          setTimeout(checkOpenCV, 100);
        }
      };
      checkOpenCV();
    };
    script.onerror = (e) => reject(new Error('Failed to load OpenCV'));
    document.body.appendChild(script);
  });
}

export async function processImage(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  adjustments: AdjustmentValues
): Promise<string> {
  try {
    // Ensure OpenCV is loaded
    await loadOpenCV();
    const cv = window.cv;

    // Read the image into a Mat
    const src = cv.imread(imageElement);
    
    // Create dst matrix
    const dst = new cv.Mat();
    
    // Convert to different color spaces depending on adjustments needed
    let processed = new cv.Mat();
    cv.cvtColor(src, processed, cv.COLOR_RGBA2RGB); // Convert to RGB for processing
    
    // Process image
    processAdjustments(cv, processed, dst, adjustments);
    
    // Create a canvas to display the result
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, dst);
    
    // Clean up
    src.delete();
    dst.delete();
    processed.delete();
    
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}

function processAdjustments(
  cv: any,
  src: any,
  dst: any,
  adjustments: AdjustmentValues
): void {
  // Apply brightness and contrast adjustments
  const alpha = adjustments.contrast / 100; // Scale to 0-2 for contrast
  const beta = (adjustments.brightness - 100) / 1.5; // Adjust -100 to 100 range to reasonable values
  
  cv.convertScaleAbs(src, dst, alpha, beta);
  
  // Apply saturation adjustment
  if (adjustments.saturation !== 100) {
    const hsvImg = new cv.Mat();
    cv.cvtColor(dst, hsvImg, cv.COLOR_RGB2HSV);
    
    const satScale = adjustments.saturation / 100;
    const channels = new cv.MatVector();
    cv.split(hsvImg, channels);
    
    // The issue is here - we need to use a proper scalar with all 4 elements
    // Create a matrix of the same size filled with the saturation scale value
    const satMat = new cv.Mat(channels.get(1).rows, channels.get(1).cols, channels.get(1).type(), [satScale, 0, 0, 0]);
    
    // Multiply the saturation channel by the scale factor
    cv.multiply(channels.get(1), satMat, channels.get(1));
    
    // Clean up the saturation matrix
    satMat.delete();
    
    // Merge channels back together
    cv.merge(channels, hsvImg);
    cv.cvtColor(hsvImg, dst, cv.COLOR_HSV2RGB);
    
    // Clean up
    hsvImg.delete();
    for (let i = 0; i < channels.size(); ++i) {
      channels.get(i).delete();
    }
    channels.delete();
  }
  
  // Apply blur if needed
  if (adjustments.blur > 0) {
    const ksize = Math.max(1, Math.floor(adjustments.blur)) * 2 + 1; // Must be odd
    cv.GaussianBlur(dst, dst, new cv.Size(ksize, ksize), 0, 0, cv.BORDER_DEFAULT);
  }
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
