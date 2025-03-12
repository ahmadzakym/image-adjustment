
import React from 'react';
import ImageEditor from '@/components/ImageEditor';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="p-6 flex flex-col items-center justify-center">
        <div className="max-w-6xl w-full">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-center">
            Image <span className="text-primary font-semibold">Adjustments</span>
          </h1>
          <p className="text-muted-foreground text-center mt-2 max-w-2xl mx-auto">
            A powerful yet simple image editor with real-time adjustments
          </p>
        </div>
      </header>
      
      <Separator className="mb-8" />
      
      <main className="flex-1 px-4 pb-12">
        <ImageEditor />
      </main>
      
      <footer className="p-6 bg-muted/30 border-t">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Powered by OpenCV.js
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
