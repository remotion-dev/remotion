import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/install-whisper-cpp/install-whisper-cpp">
          <strong>installWhisperCpp()</strong>
          <div>Install the whisper.cpp software</div>
        </TOCItem>
        <TOCItem link="/docs/install-whisper-cpp/download-whisper-model">
          <strong>downloadWhisperModel()</strong>
          <div>Download a Whisper model</div>
        </TOCItem>
        <TOCItem link="/docs/install-whisper-cpp/transcribe">
          <strong>transcribe()</strong>
          <div>Transcribe audio from a media file</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
