export type Rect = {
  width: number;
  height: number;
  top: number;
  left: number;
};

export type Layout = Rect & {
  borderRadius: number;
  opacity: number;
};

export type LayoutAndFade = {
  layout: Layout;
  shouldFadeRecording: boolean;
};

export type RecordingsLayout = {
  displayLayout: Layout | null;
  webcamLayout: Layout;
  bRollLayout: Layout;
  bRollEnterDirection: BRollEnterDirection;
};

export type BRollEnterDirection = "top" | "bottom";
export type BRollType = "scale" | "fade";
