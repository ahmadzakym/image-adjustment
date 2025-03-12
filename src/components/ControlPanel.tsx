
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, RotateCcw, Eye, EyeOff, Sliders, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdjustmentValues {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

interface ControlPanelProps {
  adjustments: AdjustmentValues;
  onAdjustmentChange: (type: keyof AdjustmentValues, value: number) => void;
  onReset: () => void;
  onDownload: () => void;
  showOriginal: boolean;
  onToggleOriginal: () => void;
  className?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  adjustments,
  onAdjustmentChange,
  onReset,
  onDownload,
  showOriginal,
  onToggleOriginal,
  className,
}) => {
  return (
    <div className={cn('w-full rounded-xl p-5 glass-card animate-slide-in', className)}>
      <div className="flex items-center justify-between mb-4 overflow-x-auto scrollbar-hide">
        <h2 className="text-md font-medium flex items-center gap-2 mr-2">
          <Sliders className="w-5 h-5 text-primary" />
          Adjustments
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleOriginal}
            className="flex items-center gap-1"
          >
            {showOriginal ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showOriginal ? 'Edited' : 'Original'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="basic" className="flex-1">Basic Adjustments</TabsTrigger>
          <TabsTrigger value="effects" className="flex-1">Effects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="brightness">Brightness</Label>
              <span className="text-sm text-muted-foreground">{adjustments.brightness}</span>
            </div>
            <Slider
              id="brightness"
              min={0}
              max={200}
              step={1}
              value={[adjustments.brightness]}
              onValueChange={(values) => onAdjustmentChange('brightness', values[0])}
              className="py-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="contrast">Contrast</Label>
              <span className="text-sm text-muted-foreground">{adjustments.contrast}</span>
            </div>
            <Slider
              id="contrast"
              min={0}
              max={200}
              step={1}
              value={[adjustments.contrast]}
              onValueChange={(values) => onAdjustmentChange('contrast', values[0])}
              className="py-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="saturation">Saturation</Label>
              <span className="text-sm text-muted-foreground">{adjustments.saturation}</span>
            </div>
            <Slider
              id="saturation"
              min={0}
              max={200}
              step={1}
              value={[adjustments.saturation]}
              onValueChange={(values) => onAdjustmentChange('saturation', values[0])}
              className="py-2"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="effects" className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="blur">Blur</Label>
              <span className="text-sm text-muted-foreground">{adjustments.blur}</span>
            </div>
            <Slider
              id="blur"
              min={0}
              max={20}
              step={0.5}
              value={[adjustments.blur]}
              onValueChange={(values) => onAdjustmentChange('blur', values[0])}
              className="py-2"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <Button 
          onClick={onDownload}
          className="w-full button-hover-effect flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Image
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
