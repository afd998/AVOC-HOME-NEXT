import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import type { PanelOption } from './constants';

interface PanelModalProps {
  isModalOpen: boolean;
  editingSource: 'left' | 'right' | 'center' | null;
  panelOptions: PanelOption[];
  onClose: () => void;
  onSelectPanel: (sourceId: string) => void;
}

export default function PanelModal({ 
  isModalOpen, 
  editingSource, 
  panelOptions, 
  onClose, 
  onSelectPanel 
}: PanelModalProps) {
  const getSourceLabel = () => {
    if (editingSource === 'left') return 'Left';
    if (editingSource === 'right') return 'Right';
    if (editingSource === 'center') return 'Center';
    return 'Source';
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Select {getSourceLabel()} Source
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {panelOptions.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              onClick={() => onSelectPanel(option.id)}
              className="flex flex-col items-center p-4 h-auto rounded-lg hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors"
            >
              <div className="relative w-16 h-16 mb-2">
                <Image
                  src={option.image}
                  alt={option.label}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-medium text-center">
                {option.label}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

