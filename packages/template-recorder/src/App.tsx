/* eslint-disable no-alert */
import React, { useCallback, useMemo, useState } from "react";
import {
  ALTERNATIVE1_PREFIX,
  ALTERNATIVE2_PREFIX,
  DISPLAY_PREFIX,
  WEBCAM_PREFIX,
} from "../config/cameras";
import "./App.css";
import type { RecordingStatus } from "./RecordButton";
import { RecordingView } from "./RecordingView";
import { TopBar } from "./TopBar";
import { WaitingForDevices } from "./WaitingForDevices";
import { EnsureBrowserSupport } from "./components/EnsureBrowserSupport";
import { Button } from "./components/ui/button";
import { MediaSourcesProvider } from "./state/media-sources";

const outer: React.CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const gridContainer: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  alignItems: "center",
  justifyItems: "center",
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  gap: 10,
  margin: 10,
  marginTop: 2,
};

const App = () => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({
    type: "idle",
  });

  const [showAllViews, setShowAllViews] = useState<boolean>(
    localStorage.getItem("showAlternativeViews") === "true",
  );

  const dynamicGridContainer = useMemo(() => {
    if (showAllViews) {
      return { ...gridContainer, gridTemplateRows: "repeat(2, 1fr)" };
    }

    return { ...gridContainer, maxHeight: "50%" };
  }, [showAllViews]);

  const handleShowMore = useCallback(() => {
    setShowAllViews(true);
    localStorage.setItem("showAlternativeViews", "true");
  }, []);

  const handleShowLess = useCallback(() => {
    setShowAllViews(false);
    localStorage.setItem("showAlternativeViews", "false");
  }, []);

  return (
    <EnsureBrowserSupport>
      <WaitingForDevices>
        <MediaSourcesProvider>
          <div style={outer}>
            <TopBar
              setRecordingStatus={setRecordingStatus}
              recordingStatus={recordingStatus}
              showAllViews={showAllViews}
            />
            <div style={dynamicGridContainer}>
              <RecordingView
                showAllViews={showAllViews}
                recordingStatus={recordingStatus}
                prefix={WEBCAM_PREFIX}
              />
              <RecordingView
                showAllViews={showAllViews}
                recordingStatus={recordingStatus}
                prefix={DISPLAY_PREFIX}
              />
              <RecordingView
                showAllViews={showAllViews}
                recordingStatus={recordingStatus}
                prefix={ALTERNATIVE1_PREFIX}
              />
              <RecordingView
                showAllViews={showAllViews}
                recordingStatus={recordingStatus}
                prefix={ALTERNATIVE2_PREFIX}
              />
            </div>

            <div style={{ marginBottom: 10, textAlign: "center" }}>
              {showAllViews ? (
                <Button
                  variant={"ghost"}
                  onClick={handleShowLess}
                  style={{ margin: "0px 10px", width: 100 }}
                >
                  Show Less
                </Button>
              ) : (
                <Button
                  variant={"ghost"}
                  onClick={handleShowMore}
                  style={{ margin: "0px 10px" }}
                >
                  Show more views
                </Button>
              )}
            </div>
          </div>
        </MediaSourcesProvider>
      </WaitingForDevices>
    </EnsureBrowserSupport>
  );
};

export default App;
