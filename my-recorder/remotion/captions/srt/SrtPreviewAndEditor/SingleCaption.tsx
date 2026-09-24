import { Caption } from "@remotion/captions";
import React, { useCallback, useMemo, useState } from "react";
import { useCaptionOverlay } from "../../editor/use-caption-overlay";

export const SrtSingleCaption: React.FC<{
  caption: Caption;
}> = ({ caption }) => {
  const overlay = useCaptionOverlay();

  const [hovered, setHovered] = useState(false);

  const onPointerEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const style: React.CSSProperties = useMemo(() => {
    return {
      cursor: "pointer",
      color: hovered ? "gray" : "inherit",
    };
  }, [hovered]);

  const onClick = useCallback(() => {
    overlay.setOpen(caption);
  }, [overlay, caption]);

  return (
    <span
      style={style}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    >
      {caption.text}
    </span>
  );
};
