
# Image Tune-o-matic

## Project Overview

A modern web application for image processing and editing. This tool allows users to upload images and make various adjustments including brightness, contrast, saturation, and blur.

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- OpenCV.js for image processing

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn

### Installation

Follow these steps to run the project locally:

```sh
# Clone the repository
git clone [repository-url]

# Navigate to the project directory
cd image-adjustment

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080` by default.

## Features

- Image upload via drag & drop
- Adjustable parameters:
  - Brightness
  - Contrast
  - Saturation
  - Blur
- Real-time image processing
- Download processed images

## Building for Production

```sh
npm run build
```

This will generate optimized assets in the `dist` folder that can be deployed to any static hosting service.
