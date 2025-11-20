import { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { BYOD_OPTIONS } from "./constants";

interface DeviceSelectPopoverProps {
  targetDevice: "left" | "right" | "center";
  onSelectDevice: (deviceName: string) => void;
  trigger: ReactNode;
}

export default function DeviceSelectPopover({
  targetDevice,
  onSelectDevice,
  trigger,
}: DeviceSelectPopoverProps) {
  const getDeviceLabel = () => {
    if (targetDevice === "left") return "Left Device";
    if (targetDevice === "right") return "Right Device";
    if (targetDevice === "center") return "Center Device";
    return "Device";
  };

  const handleSelect = (value: string) => {
    const deviceName = BYOD_OPTIONS[parseInt(value)];
    if (deviceName) {
      onSelectDevice(deviceName);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-56" align="center">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Select {getDeviceLabel()}</h4>
          <Select onValueChange={handleSelect}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  BYOD_OPTIONS.length
                    ? "Choose a device"
                    : "No devices available"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {BYOD_OPTIONS.map((deviceName, index) => (
                <SelectItem key={index} value={String(index)}>
                  {deviceName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}

