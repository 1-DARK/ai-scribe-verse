import { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChartFullscreenViewerProps {
  imageUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChartFullscreenViewer = ({ imageUrl, title, isOpen, onClose }: ChartFullscreenViewerProps) => {
  const [scale, setScale] = useState(1);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleClose = () => {
    setScale(1);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col"
      onClick={handleClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-border/30 bg-gradient-to-b from-zinc-900/90 to-transparent">
        <h3 className="text-sm md:text-base font-medium text-white capitalize truncate flex-1 mr-2">
          {title.replace(/_/g, ' ')}
        </h3>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/10"
          >
            <ZoomOut className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/10"
          >
            <ZoomIn className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 md:h-9 md:w-9 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        className="flex-1 overflow-auto p-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title}
          className={cn(
            "max-w-full h-auto transition-transform duration-200 touch-pan-x touch-pan-y",
            "rounded-lg shadow-2xl"
          )}
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'center center'
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Footer hint */}
      <div className="p-3 text-center text-xs md:text-sm text-gray-400 bg-gradient-to-t from-zinc-900/90 to-transparent">
        Tap outside or press × to close • Use +/- to zoom
      </div>
    </div>
  );
};
