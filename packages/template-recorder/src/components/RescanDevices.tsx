import { useContext } from "react";
import { DevicesContext } from "../WaitingForDevices";

export const RescanDevices = () => {
  const ctx = useContext(DevicesContext);

  return (
    <div
      onClick={() => ctx?.rescan()}
      data-disabled={ctx?.isRescanning}
      className="cursor-pointer hover:underline inline opacity-70 hover:opacity-100 transition-opacity data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
    >
      {ctx?.isRescanning ? "Rescanning..." : "Rescan devices"}
    </div>
  );
};
