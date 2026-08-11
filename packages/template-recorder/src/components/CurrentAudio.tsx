import { MicIcon } from "lucide-react";
import React, { useMemo } from "react";

const spacer: React.CSSProperties = {
  width: 12,
};

export const CurrentAudio: React.FC<{
  label: string | null;
  onClick: () => void;
  disabled: boolean;
}> = ({ label, onClick, disabled }) => {
  const container: React.CSSProperties = useMemo(() => {
    return {
      display: "flex",
      flexDirection: "row",
      fontSize: 13,
      alignItems: "center",
      flex: 1,
      lineHeight: 1.4,
      paddingLeft: 10,
      cursor: "pointer",
      height: "100%",
    };
  }, []);

  return (
    <div
      data-disabled={disabled}
      className="hover:bg-slate-950 data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none"
      style={container}
      onClick={onClick}
    >
      <MicIcon></MicIcon>
      <div style={spacer}></div>
      <div>{label ?? "No audio selected"}</div>
    </div>
  );
};
