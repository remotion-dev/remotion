import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getDevices } from "./helpers/get-devices";

export type DevicesContext = {
  devices: MediaDeviceInfo[] | null;
  rescan: () => Promise<void>;
  isRescanning: boolean;
};

export const DevicesContext = createContext<DevicesContext | null>(null);

export const WaitingForDevices: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[] | null>(null);
  const [isRescanning, setIsRescanning] = useState(false);

  const checkDeviceLabels = useCallback(async () => {
    try {
      const fetchedDevices = await getDevices();
      setDevices(fetchedDevices);
    } catch (err) {
      alert((err as Error).message);
      console.log(err);
    }
  }, []);

  useEffect(() => {
    checkDeviceLabels();
  }, [checkDeviceLabels]);

  const value: DevicesContext = useMemo(
    () => ({
      devices,
      rescan: async () => {
        try {
          setIsRescanning(true);
          // Show scanning label for at least 250ms
          // to indicate that rescanning was successful
          await Promise.all([
            checkDeviceLabels(),
            new Promise((resolve) => setTimeout(resolve, 250)),
          ]);
        } finally {
          setIsRescanning(false);
        }
      },
      isRescanning,
    }),
    [devices, checkDeviceLabels, isRescanning],
  );

  if (devices === null) {
    return (
      <div className="absolute inset-0 flex justify-center items-center text-sm text-muted-foreground">
        Finding devices...
      </div>
    );
  }

  return (
    <DevicesContext.Provider value={value}>{children}</DevicesContext.Provider>
  );
};

export const useDevices = (): MediaDeviceInfo[] => {
  const context = useContext(DevicesContext);
  if (!context?.devices) {
    throw new Error("useDevices must be used within a DevicesContextProvider");
  }

  return context.devices;
};
