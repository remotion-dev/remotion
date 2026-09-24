import { DialogTitle } from "@radix-ui/react-dialog";
import React, { useCallback, useMemo } from "react";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "./components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { MaxResolution } from "./helpers/get-max-resolution-of-device";
import {
  FPS_AVAILABLE,
  SizeConstraint,
  VIDEO_SIZES,
  VideoSize,
} from "./helpers/get-selected-video-source";
import { setPreferredResolutionForDevice } from "./preferred-resolution";

export const ResolutionLimiter: React.FC<{
  maxResolution: MaxResolution;
  sizeConstraint: SizeConstraint;
  setSizeConstraint: React.Dispatch<React.SetStateAction<SizeConstraint>>;
  deviceName: string;
  deviceId: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  deviceName,
  maxResolution,
  sizeConstraint,
  setSizeConstraint: setActiveVideoSize,
  deviceId,
  open,
  setOpen,
}) => {
  const availableLowerResolutions = useMemo(() => {
    return Object.entries(VIDEO_SIZES).filter(([, value]) => {
      if (maxResolution === null) {
        return true;
      }
      return (
        (maxResolution.width === null || value.width <= maxResolution.width) &&
        (maxResolution.height === null || value.height <= maxResolution.height)
      );
    });
  }, [maxResolution]);

  const availableHigherFps = useMemo(() => {
    return FPS_AVAILABLE.filter((fps) => {
      if (maxResolution === null || maxResolution.frameRate === null) {
        return true;
      }
      return fps <= maxResolution.frameRate;
    }).reverse();
  }, [maxResolution]);

  const onResolutionChange = useCallback(
    (value: VideoSize | "full") => {
      if (value === "full") {
        setActiveVideoSize((v) => {
          const newSize = {
            ...v,
            maxSize: null,
          };
          setPreferredResolutionForDevice(deviceId, newSize);
          return newSize;
        });
        setPreferredResolutionForDevice(deviceId, null);
        return;
      }

      setActiveVideoSize((v) => {
        const newSize = {
          ...v,
          maxSize: value,
        };
        setPreferredResolutionForDevice(deviceId, newSize);
        return newSize;
      });
    },
    [deviceId, setActiveVideoSize],
  );

  const onFpsChange = useCallback(
    (value: string | "any") => {
      if (value === "any") {
        setActiveVideoSize((v) => {
          const newState: SizeConstraint = {
            ...v,
            minimumFps: null,
          };
          setPreferredResolutionForDevice(deviceId, newState);

          return newState;
        });
        return;
      }

      setActiveVideoSize((v) => {
        const newSize: SizeConstraint = {
          ...v,
          minimumFps: Number(value),
        };
        setPreferredResolutionForDevice(deviceId, newSize);

        return newSize;
      });
    },
    [deviceId, setActiveVideoSize],
  );

  const handleSubmit = useCallback(async () => {
    setOpen(false);
  }, [setOpen]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open);
    },
    [setOpen],
  );

  const fullResolutionLabel = useMemo(() => {
    if (maxResolution === null) {
      return "Full resolution";
    }
    const { width, height } = maxResolution;
    if (width && !height) {
      return `Full resolution (${width}p)`;
    }

    return "Full resolution";
  }, [maxResolution]);

  const labelForFps = useCallback((fps: number | null) => {
    return fps === null ? "Default" : `At least ${fps} FPS`;
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Limit resolution</DialogTitle>
            <DialogDescription>
              Constrain the resolution of {deviceName} to a lower value if you
              experience dropped frames.
            </DialogDescription>
          </DialogHeader>
          <Select onValueChange={onResolutionChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={sizeConstraint.maxSize ?? fullResolutionLabel}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={"full"} value={"full"}>
                <span
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {fullResolutionLabel}
                </span>
              </SelectItem>
              {availableLowerResolutions.map(([key]) => (
                <SelectItem key={key} value={key}>
                  <span style={{ whiteSpace: "nowrap" }}>Limit to {key}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <br />
          <DialogHeader>
            <DialogTitle>Minimum frame rate</DialogTitle>
            {maxResolution.frameRate === null ? (
              <DialogDescription>
                {deviceName} might be able to record in higher FPS, but the
                resolution might drop.
              </DialogDescription>
            ) : (
              <DialogDescription>
                {deviceName} can record in up to{" "}
                {Math.floor(maxResolution.frameRate * 100) / 100} FPS, but this
                might drop the resolution.
              </DialogDescription>
            )}
          </DialogHeader>
          <Select onValueChange={onFpsChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={labelForFps(sizeConstraint.minimumFps ?? null)}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={"any"} value={"any"}>
                <span
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  Default
                </span>
              </SelectItem>
              {availableHigherFps.map((key) => (
                <SelectItem key={key} value={String(key)}>
                  <span style={{ whiteSpace: "nowrap" }}>
                    {labelForFps(key)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
