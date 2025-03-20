import { AdjustmentValues, FilterType } from "@/components/ControlPanel";

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
    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.7.0/opencv.js";
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
    script.onerror = (e) => reject(new Error("Failed to load OpenCV"));
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
    const canvas = document.createElement("canvas");
    cv.imshow(canvas, dst);

    // Clean up
    src.delete();
    dst.delete();
    processed.delete();

    return canvas.toDataURL("image/jpeg", 0.95);
  } catch (error) {
    console.error("Image processing error:", error);
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

    // Maps the 0-200 range to appropriate saturation scaling
    // 0 -> 0 (no saturation), 100 -> 1 (original), 200 -> 2 (double saturation)
    const satFactor = adjustments.saturation / 100;

    // Split the HSV image into individual channels
    const channels = new cv.MatVector();
    cv.split(hsvImg, channels);

    // Get the saturation channel (index 1)
    const satChannel = channels.get(1);

    // Create a matrix to store the result of saturation scaling
    const scaledSat = new cv.Mat();

    // Instead of using multiply with a scalar, we'll use convertScaleAbs
    // This avoids the "Cannot pass X as a Mat" binding error
    cv.convertScaleAbs(satChannel, scaledSat, satFactor, 0);

    // The saturation channel in OpenCV's HSV format has values from 0-255
    // Make sure we don't exceed 255
    const maxVal = new cv.Mat(
      satChannel.rows,
      satChannel.cols,
      satChannel.type(),
      new cv.Scalar(255)
    );
    const clippedSat = new cv.Mat();
    cv.min(scaledSat, maxVal, clippedSat);

    // Replace the original saturation channel with our adjusted one
    channels.set(1, clippedSat);

    // Merge the channels back into a single image
    cv.merge(channels, hsvImg);

    // Convert back to RGB
    cv.cvtColor(hsvImg, dst, cv.COLOR_HSV2RGB);

    // Clean up
    hsvImg.delete();
    scaledSat.delete();
    maxVal.delete();
    clippedSat.delete();
    for (let i = 0; i < channels.size(); ++i) {
      channels.get(i).delete();
    }
    channels.delete();
  }

  // Apply blur if needed
  if (adjustments.blur > 0) {
    const ksize = Math.max(1, Math.floor(adjustments.blur)) * 2 + 1; // Must be odd
    cv.GaussianBlur(
      dst,
      dst,
      new cv.Size(ksize, ksize),
      0,
      0,
      cv.BORDER_DEFAULT
    );
  }

  // Apply filters
  applyFilter(cv, dst, dst, adjustments.filter);
}

function applyFilter(
  cv: any,
  src: any,
  dst: any,
  filterType: FilterType
): void {
  switch (filterType) {
    case "grayscale":
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGB2GRAY);
      cv.cvtColor(gray, dst, cv.COLOR_GRAY2RGB);
      gray.delete();
      break;

    case "sepia":
      const rgbPlanes = new cv.MatVector();
      cv.split(src, rgbPlanes);

      // OpenCV stores channels in BGR order
      const bChannel = rgbPlanes.get(0);
      const gChannel = rgbPlanes.get(1);
      const rChannel = rgbPlanes.get(2);

      const rOutput = new cv.Mat();
      const gOutput = new cv.Mat();
      const bOutput = new cv.Mat();
      const temp = new cv.Mat();

      // Apply sepia transformation
      cv.addWeighted(rChannel, 0.393, gChannel, 0.769, 0, temp);
      cv.addWeighted(temp, 1, bChannel, 0.189, 0, rOutput);

      cv.addWeighted(rChannel, 0.349, gChannel, 0.686, 0, temp);
      cv.addWeighted(temp, 1, bChannel, 0.168, 0, gOutput);

      cv.addWeighted(rChannel, 0.272, gChannel, 0.534, 0, temp);
      cv.addWeighted(temp, 1, bChannel, 0.131, 0, bOutput);

      temp.delete();

      // Merge channels back in BGR order
      const sepiaPlanes = new cv.MatVector();
      sepiaPlanes.push_back(bOutput);
      sepiaPlanes.push_back(gOutput);
      sepiaPlanes.push_back(rOutput);
      cv.merge(sepiaPlanes, dst);

      // Clean up
      rChannel.delete();
      gChannel.delete();
      bChannel.delete();
      sepiaPlanes.delete();
      rOutput.delete();
      gOutput.delete();
      bOutput.delete();
      rgbPlanes.delete();
      break;

    case "invert":
      // Invert colors
      cv.bitwise_not(src, dst);
      break;

    case "posterize":
      // Posterize effect by reducing color levels
      // Since LUT is not available, we'll implement posterize manually
      const levels = 5;
      const step = 255 / (levels - 1);

      // Create temporary matrices for each channel
      const rgbChannels = new cv.MatVector();
      cv.split(src, rgbChannels);

      for (let i = 0; i < rgbChannels.size(); ++i) {
        const channel = rgbChannels.get(i);
        const posterizedChannel = new cv.Mat();

        // Apply floor division and multiplication to create posterize effect
        // Formula: floor(pixel_value / step) * step
        cv.convertScaleAbs(channel, posterizedChannel, 1 / step, 0);
        cv.convertScaleAbs(posterizedChannel, posterizedChannel, step, 0);

        // Replace the original channel
        rgbChannels.set(i, posterizedChannel);
        channel.delete();
      }

      // Merge the channels back
      cv.merge(rgbChannels, dst);

      // Clean up remaining channels
      for (let i = 0; i < rgbChannels.size(); ++i) {
        rgbChannels.get(i).delete();
      }
      rgbChannels.delete();
      break;

    case "none":
    default:
      // No filter, just copy the source
      src.copyTo(dst);
      break;
  }
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
