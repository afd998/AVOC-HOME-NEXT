import React from 'react';
import { useShiftBlocks, ShiftBlock, useAllRoomsAssigned } from '@/features/SessionAssignments/hooks/useShiftBlocks';
import ShiftBlockLine from './ShiftBlockLine';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useEventAssignmentsStore } from '@/lib/stores/event-assignments';

const toMinutes = (t?: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(':');
  const hours = Number.parseInt(h, 10);
  const minutes = Number.parseInt(m, 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

interface ShiftBlockLinesProps {
  date: string;
  className?: string;
  pixelsPerMinute: number;
  contentWidth: number;
  pageZoom: number;
  scrollLeft: number;
  startHour: number;
  onSelectRange?: (range: { leftPx: number; widthPx: number } | null) => void;
}

const ShiftBlockLines: React.FC<ShiftBlockLinesProps> = ({ date, className = '', pixelsPerMinute, contentWidth, pageZoom, scrollLeft, startHour, onSelectRange }) => {
  const { data: shiftBlocks, isLoading, error } = useShiftBlocks(date);
  const { data: allRoomsAssigned } = useAllRoomsAssigned(date);
  const {
    selectedShiftBlockId,
    setSelectedShiftBlockId,
    selectedShiftBlock,
    setSelectedShiftBlock,
    selectedShiftBlockIndex,
    setSelectedShiftBlockIndex,
    resetShiftBlockSelection
  } = useEventAssignmentsStore();

  React.useEffect(() => {
    if (!shiftBlocks || shiftBlocks.length === 0) {
      if (
        selectedShiftBlockId !== null ||
        selectedShiftBlock !== null ||
        selectedShiftBlockIndex !== null
      ) {
        resetShiftBlockSelection();
        if (onSelectRange) onSelectRange(null);
      }
      return;
    }

    if (selectedShiftBlockIndex != null) {
      if (selectedShiftBlockIndex >= 0 && selectedShiftBlockIndex < shiftBlocks.length) {
        const blockAtIndex = shiftBlocks[selectedShiftBlockIndex];
        const blockId = blockAtIndex.id.toString();
        if (selectedShiftBlockId !== blockId) {
          setSelectedShiftBlockId(blockId);
        }
        if (!selectedShiftBlock || selectedShiftBlock.id !== blockAtIndex.id) {
          setSelectedShiftBlock(blockAtIndex);
        }
        return;
      }
    }

    if (selectedShiftBlockId) {
      const matchById = shiftBlocks.find(b => b.id.toString() === selectedShiftBlockId);
      if (matchById) {
        setSelectedShiftBlockIndex(shiftBlocks.indexOf(matchById));
        if (!selectedShiftBlock || selectedShiftBlock.id !== matchById.id) {
          setSelectedShiftBlock(matchById);
        }
        return;
      }
      if (selectedShiftBlock) {
        const matchByTime = shiftBlocks.find(b =>
          b.startTime === selectedShiftBlock.startTime &&
          b.endTime === selectedShiftBlock.endTime
        );
        if (matchByTime) {
          setSelectedShiftBlockId(matchByTime.id.toString());
          setSelectedShiftBlock(matchByTime);
          setSelectedShiftBlockIndex(shiftBlocks.indexOf(matchByTime));
          return;
        }
      }
    }

    const first = shiftBlocks[0];
    setSelectedShiftBlockId(first.id.toString());
    setSelectedShiftBlock(first);
    setSelectedShiftBlockIndex(0);
  }, [
    shiftBlocks,
    selectedShiftBlockId,
    selectedShiftBlock,
    selectedShiftBlockIndex,
    setSelectedShiftBlockId,
    setSelectedShiftBlock,
    setSelectedShiftBlockIndex,
    resetShiftBlockSelection,
    onSelectRange
  ]);

  if (isLoading) {
    return (
      <div className={`py-2 ${className}`}>
        <div className="text-sm text-gray-500 dark:text-gray-300">Loading shift blocks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-sm text-red-500">Error loading shift blocks</div>
      </div>
    );
  }

  if (!shiftBlocks || shiftBlocks.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-sm text-gray-500 dark:text-gray-300">No shift blocks found for this date</div>
      </div>
    );
  }

  const selectedExists = !!selectedShiftBlockId && shiftBlocks.some(b => b.id.toString() === selectedShiftBlockId);
  const currentValue = selectedExists
    ? selectedShiftBlockId as string
    : (selectedShiftBlockIndex != null && selectedShiftBlockIndex >= 0 && selectedShiftBlockIndex < shiftBlocks.length)
        ? shiftBlocks[selectedShiftBlockIndex].id.toString()
        : (shiftBlocks.length > 0 ? shiftBlocks[0].id.toString() : undefined);

  return (
    <Tabs 
      value={currentValue}
      onValueChange={(val) => {
        const sbIndex = shiftBlocks.findIndex(b => b.id.toString() === val);
        const sb = sbIndex >= 0 ? shiftBlocks[sbIndex] : null;
        setSelectedShiftBlockId(val);
        setSelectedShiftBlock(sb);
        setSelectedShiftBlockIndex(sbIndex >= 0 ? sbIndex : null);
        if (!onSelectRange) return;
        if (!sb || !sb.startTime || !sb.endTime) { onSelectRange(null); return; }
        const startMin = toMinutes(sb.startTime);
        const endMin = toMinutes(sb.endTime);
        if (startMin == null || endMin == null) { onSelectRange(null); return; }
        const startOffsetMin = startMin - (startHour*60);
        const widthMin = Math.max(0, endMin - startMin);
        const leftPx = startOffsetMin * pixelsPerMinute;
        const widthPx = widthMin * pixelsPerMinute;
        onSelectRange({ leftPx, widthPx });
      }}
      className={`w-full gap-4 ${className}`}
      style={{ width: `${contentWidth * pageZoom}px` }}
    >
      <TabsList className="relative bg-background rounded-none border-b p-0 flex-nowrap">
        {(() => {
          let previousEndMinutes = startHour * 60;
          return shiftBlocks.map((shiftBlock: ShiftBlock, index: number) => {
            const startMinutes = toMinutes(shiftBlock.startTime);
            const endMinutes = toMinutes(shiftBlock.endTime) ?? startMinutes ?? previousEndMinutes;
            const gapMinutes = startMinutes != null ? Math.max(0, startMinutes - previousEndMinutes) : 0;
            const marginLeftPx = gapMinutes * pixelsPerMinute * pageZoom;
            previousEndMinutes = endMinutes ?? previousEndMinutes;

            return (
              <React.Fragment key={shiftBlock.id}>
                <TabsTrigger 
                  value={shiftBlock.id.toString()}
                  className="w-auto px-0 mx-0 bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none flex-none"
                  style={{ marginLeft: `${marginLeftPx}px` }}
                >
                  <ShiftBlockLine 
                    shiftBlock={shiftBlock}
                    pixelsPerMinute={pixelsPerMinute}
                    pageZoom={pageZoom}
                    allRoomsAssigned={!!allRoomsAssigned}
                  />
                </TabsTrigger>
                {index < shiftBlocks.length - 1 && (
                  <Separator orientation="vertical" className="h-8 " />
                )}
              </React.Fragment>
            );
          });
        })()}
      </TabsList>

     
    </Tabs>
  );
};

export default ShiftBlockLines;
