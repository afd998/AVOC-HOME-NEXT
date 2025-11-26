"use client";

import { useState } from "react";
import Image from "next/image";
import type { EventAVConfigRow } from "shared/db/types";
import { Item, ItemContent, ItemTitle, ItemDescription } from "../../components/ui/item";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../components/ui/tooltip";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { X, Plus, Laptop, Tablet } from "lucide-react";
import PanelModal from "./PanelModal";
import DeviceSelectPopover from "./DeviceSelectPopover";
import { PANEL_OPTIONS, getPanelImageSrc, BYOD_OPTIONS } from "./constants";
import { useEventConfiguration } from "../event/EventDetails/EventConfigurationContext";

interface AvConfigurationProps {
  avConfig: EventAVConfigRow;
  roomName: string;
}

export default function AvConfiguration({ 
  avConfig, 
  roomName, 
}: AvConfigurationProps) {
  const { isEditable, onUpdate } = useEventConfiguration();
  const isGH4OrGH5 = roomName.startsWith("GH 4") || roomName.startsWith("GH 5");
  const isGH5101 = roomName === "GH 5101";
  const shouldShowLeftRightSources = !isGH4OrGH5 || isGH5101;
  const shouldShowCenterSource = isGH4OrGH5 && !isGH5101;

  // Modal state
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<"left" | "right" | "center" | null>(null);

  const handleSelectSource = async (sourceId: string | null) => {
    if (!editingSource) return;
    
    const avConfig: { leftSource?: string | null; rightSource?: string | null; centerSource?: string | null } = {};
    if (editingSource === "left") avConfig.leftSource = sourceId;
    if (editingSource === "right") avConfig.rightSource = sourceId;
    if (editingSource === "center") avConfig.centerSource = sourceId;
    
    await onUpdate({ avConfig });
    setIsPanelModalOpen(false);
    setEditingSource(null);
  };

  const handleSelectDevice = async (deviceType: "left" | "right" | "center", deviceName: string) => {
    const avConfig: { leftDevice?: string; rightDevice?: string; centerDevice?: string } = {};
    if (deviceType === "left") avConfig.leftDevice = deviceName;
    if (deviceType === "right") avConfig.rightDevice = deviceName;
    if (deviceType === "center") avConfig.centerDevice = deviceName;
    
    await onUpdate({ avConfig });
  };

  const handleRemoveDevice = async (deviceType: "left" | "right" | "center") => {
    const avConfig: { leftDevice?: string | null; rightDevice?: string | null; centerDevice?: string | null } = {};
    if (deviceType === "left") avConfig.leftDevice = null;
    if (deviceType === "right") avConfig.rightDevice = null;
    if (deviceType === "center") avConfig.centerDevice = null;
    
    await onUpdate({ avConfig });
  };

  const openPanelModal = (source: "left" | "right" | "center") => {
    setEditingSource(source);
    setIsPanelModalOpen(true);
  };

  const renderByodIcon = (deviceName?: string | null) => {
    const name = (deviceName || "").toUpperCase();
    if (
      name.includes("MAC") ||
      name.includes("PC") ||
      name.includes("LAPTOP") ||
      name.includes("SURFACE")
    )
      return <Laptop className="w-3.5 h-3.5" />;
    if (name.includes("IPAD") || name.includes("TABLET"))
      return <Tablet className="w-3.5 h-3.5" />;
    return <Laptop className="w-3.5 h-3.5" />;
  };

  return (
    <>
      {shouldShowLeftRightSources && (
        <Item size="sm">
          <ItemContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <ItemTitle className="mb-2">Left Source</ItemTitle>
                {isEditable ? (
                  <Button
                    onClick={() => openPanelModal("left")}
                    className="w-full h-20 rounded-lg border border-border flex items-center justify-center transition-colors cursor-pointer relative overflow-hidden hover:bg-accent hover:border-accent-foreground/20"
                    variant="outline"
                    title="Click to change source"
                  >
                    {avConfig.leftSource === "No Source" ? (
                      <span className="text-muted-foreground">No Source</span>
                    ) : avConfig.leftSource ? (
                      <Image
                        src={getPanelImageSrc(avConfig.leftSource)}
                        alt="Left source"
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <span className="text-muted-foreground">Not Set</span>
                    )}
                  </Button>
                ) : (
                  <div className="w-full rounded-lg border border-border flex items-center justify-center min-h-[60px] p-2">
                    {avConfig.leftSource === "No Source" ? (
                      <span className="text-muted-foreground">No Source</span>
                    ) : avConfig.leftSource ? (
                      <span>{avConfig.leftSource.replace(/_/g, " ")}</span>
                    ) : (
                      <span className="text-muted-foreground">Not Set</span>
                    )}
                  </div>
                )}
                {isEditable && avConfig.leftSource && avConfig.leftSource !== "DOC_CAM" && avConfig.leftSource !== "No Source" && (
                  <div className="mt-2 flex justify-center">
                    {avConfig.leftDevice ? (
                      <Badge
                        className="cursor-default flex items-center gap-1 pr-1"
                        variant="outline"
                        title={avConfig.leftDevice}
                      >
                        {renderByodIcon(avConfig.leftDevice)}
                        <span>{avConfig.leftDevice}</span>
                        {(avConfig.leftSource === "ROOM_PC" || avConfig.leftSource === "PC_EXT") && (
                          <span className="text-muted-foreground text-xs ml-1">Mirror 360</span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-5 w-5 p-0 rounded hover:bg-black/10"
                          title="Remove device"
                          onClick={() => handleRemoveDevice("left")}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </Badge>
                    ) : (
                      <DeviceSelectPopover
                        targetDevice="left"
                        onSelectDevice={(deviceName) => handleSelectDevice("left", deviceName)}
                        trigger={
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full border-2 border-dashed"
                            title="Add device"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        }
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <ItemTitle className="mb-2">Right Source</ItemTitle>
                {isEditable ? (
                  <Button
                    onClick={() => openPanelModal("right")}
                    className="w-full h-20 rounded-lg border border-border flex items-center justify-center transition-colors cursor-pointer relative overflow-hidden hover:bg-accent hover:border-accent-foreground/20"
                    variant="outline"
                    title="Click to change source"
                  >
                    {avConfig.rightSource === "No Source" ? (
                      <span className="text-muted-foreground">No Source</span>
                    ) : avConfig.rightSource ? (
                      <Image
                        src={getPanelImageSrc(avConfig.rightSource)}
                        alt="Right source"
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <span className="text-muted-foreground">Not Set</span>
                    )}
                  </Button>
                ) : (
                  <div className="w-full rounded-lg border border-border flex items-center justify-center min-h-[60px] p-2">
                    {avConfig.rightSource === "No Source" ? (
                      <span className="text-muted-foreground">No Source</span>
                    ) : avConfig.rightSource ? (
                      <span>{avConfig.rightSource.replace(/_/g, " ")}</span>
                    ) : (
                      <span className="text-muted-foreground">Not Set</span>
                    )}
                  </div>
                )}
                {isEditable && avConfig.rightSource && avConfig.rightSource !== "DOC_CAM" && avConfig.rightSource !== "No Source" && (
                  <div className="mt-2 flex justify-center">
                    {avConfig.rightDevice ? (
                      <Badge
                        className="cursor-default flex items-center gap-1 pr-1"
                        variant="outline"
                        title={avConfig.rightDevice}
                      >
                        {renderByodIcon(avConfig.rightDevice)}
                        <span>{avConfig.rightDevice}</span>
                        {(avConfig.rightSource === "ROOM_PC" || avConfig.rightSource === "PC_EXT") && (
                          <span className="text-muted-foreground text-xs ml-1">Mirror 360</span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-5 w-5 p-0 rounded hover:bg-black/10"
                          title="Remove device"
                          onClick={() => handleRemoveDevice("right")}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </Badge>
                    ) : (
                      <DeviceSelectPopover
                        targetDevice="right"
                        onSelectDevice={(deviceName) => handleSelectDevice("right", deviceName)}
                        trigger={
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full border-2 border-dashed"
                            title="Add device"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </ItemContent>
        </Item>
      )}
      {shouldShowCenterSource && (
        <Item size="sm">
          <ItemContent>
            <ItemTitle>Center Source</ItemTitle>
            <ItemDescription>
              {isEditable ? (
                <>
                  <Button
                    onClick={() => openPanelModal("center")}
                    className="w-full h-20 rounded-lg border border-border flex items-center justify-center transition-colors cursor-pointer relative overflow-hidden hover:bg-accent hover:border-accent-foreground/20"
                    variant="outline"
                    title="Click to change source"
                  >
                    {avConfig.centerSource === "No Source" ? (
                      <span className="text-muted-foreground">No Source</span>
                    ) : avConfig.centerSource ? (
                      <Image
                        src={getPanelImageSrc(avConfig.centerSource)}
                        alt="Center source"
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <span className="text-muted-foreground">Not Set</span>
                    )}
                  </Button>
                  {avConfig.centerSource && avConfig.centerSource !== "DOC_CAM" && avConfig.centerSource !== "No Source" && (
                    <div className="mt-2 flex justify-center">
                      {avConfig.centerDevice ? (
                        <Badge
                          className="cursor-default flex items-center gap-1 pr-1"
                          variant="outline"
                          title={avConfig.centerDevice}
                        >
                          {renderByodIcon(avConfig.centerDevice)}
                          <span>{avConfig.centerDevice}</span>
                          {(avConfig.centerSource === "ROOM_PC" || avConfig.centerSource === "PC_EXT") && (
                            <span className="text-muted-foreground text-xs ml-1">Mirror 360</span>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="ml-1 h-5 w-5 p-0 rounded hover:bg-black/10"
                            title="Remove device"
                            onClick={() => handleRemoveDevice("center")}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </Badge>
                      ) : (
                        <DeviceSelectPopover
                          targetDevice="center"
                          onSelectDevice={(deviceName) => handleSelectDevice("center", deviceName)}
                          trigger={
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="w-8 h-8 rounded-full border-2 border-dashed"
                              title="Add device"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full rounded-lg border border-border flex items-center justify-center min-h-[60px] p-2">
                  {avConfig.centerSource === "No Source" ? (
                    <span className="text-muted-foreground">No Source</span>
                  ) : avConfig.centerSource ? (
                    <span>{avConfig.centerSource.replace(/_/g, " ")}</span>
                  ) : (
                    <span className="text-muted-foreground">Not Set</span>
                  )}
                </div>
              )}
            </ItemDescription>
          </ItemContent>
        </Item>
      )}
      {!isEditable && (
        <>
          {avConfig.leftDevice && (
            <Item size="sm">
              <ItemContent>
                <ItemTitle>Left Device</ItemTitle>
                <ItemDescription>
                  {avConfig.leftDevice}
                  {(avConfig.leftSource === "ROOM_PC" || avConfig.leftSource === "PC_EXT") && (
                    <span className="text-muted-foreground text-xs ml-2">Mirror 360</span>
                  )}
                </ItemDescription>
              </ItemContent>
            </Item>
          )}
          {avConfig.rightDevice && (
            <Item size="sm">
              <ItemContent>
                <ItemTitle>Right Device</ItemTitle>
                <ItemDescription>
                  {avConfig.rightDevice}
                  {(avConfig.rightSource === "ROOM_PC" || avConfig.rightSource === "PC_EXT") && (
                    <span className="text-muted-foreground text-xs ml-2">Mirror 360</span>
                  )}
                </ItemDescription>
              </ItemContent>
            </Item>
          )}
          {avConfig.centerDevice && (
            <Item size="sm">
              <ItemContent>
                <ItemTitle>Center Device</ItemTitle>
                <ItemDescription>
                  {avConfig.centerDevice}
                  {(avConfig.centerSource === "ROOM_PC" || avConfig.centerSource === "PC_EXT") && (
                    <span className="text-muted-foreground text-xs ml-2">Mirror 360</span>
                  )}
                </ItemDescription>
              </ItemContent>
            </Item>
          )}
        </>
      )}
      {(avConfig.handhelds > 0 || avConfig.lapels > 0 || avConfig.clicker) && (
        <Item size="sm">
          <div className="flex items-center gap-3">
            {avConfig.handhelds > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative cursor-pointer">
                    <div className="size-10 flex items-center justify-center">
                      <img 
                        src="/images/microphone.png" 
                        alt="Handheld microphone" 
                        className="size-8 object-contain dark:invert"
                      />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full min-w-[1rem] h-4 flex items-center justify-center px-0.5 z-10 border-2 border-background">
                      {avConfig.handhelds}x
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Handhelds</p>
                </TooltipContent>
              </Tooltip>
            )}
            {avConfig.lapels > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative cursor-pointer">
                    <div className="size-10 flex items-center justify-center">
                      <img 
                        src="/images/lapel-microphone.png" 
                        alt="Lapel microphone" 
                        className="size-8 object-contain dark:invert"
                      />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full min-w-[1rem] h-4 flex items-center justify-center px-0.5 z-10 border-2 border-background">
                      {avConfig.lapels}x
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lapels</p>
                </TooltipContent>
              </Tooltip>
            )}
            {avConfig.clicker && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative cursor-pointer">
                    <div className="size-10 flex items-center justify-center">
                      <img 
                        src="/images/clicker.png" 
                        alt="Presentation clicker" 
                        className="size-8 object-contain dark:invert"
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clicker</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </Item>
      )}
      
      {/* Modals */}
      <PanelModal
        isModalOpen={isPanelModalOpen}
        editingSource={editingSource}
        panelOptions={PANEL_OPTIONS}
        onClose={() => {
          setIsPanelModalOpen(false);
          setEditingSource(null);
        }}
        onSelectPanel={handleSelectSource}
      />
    </>
  );
}

