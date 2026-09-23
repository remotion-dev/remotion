import {ding, mouseClick, pageTurn, recordScratch, vineBoom, whoosh} from "@remotion/sfx";
import {useEffect, useState} from "react";
import {AbsoluteFill, cancelRender, continueRender, delayRender, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

type Status = "checking" | "reachable" | "blocked";

const SOUNDS = [
  {name: "whoosh", url: whoosh},
  {name: "ding", url: ding},
  {name: "vineBoom", url: vineBoom},
  {name: "pageTurn", url: pageTurn},
  {name: "mouseClick", url: mouseClick},
  {name: "recordScratch", url: recordScratch},
];

// Demonstrates: @remotion/sfx -- a curated library of royalty-free sound
// effect URLs (each export is just a `https://remotion.media/*.wav` string,
// meant to be passed straight to <Audio src={...}> from @remotion/media).
// The exports themselves need no network access to import and use in
// code -- only *playing* the actual audio does, and remotion.media is the
// same host that blocks @remotion/video-matting's/whisper-webgpu's model
// downloads in this sandbox (see AGENTS.md), so this checks reachability
// honestly rather than assuming success, the same pattern as those scenes.
export const SfxScene: React.FC = () => {
  const {width} = useVideoConfig();
  const [handle] = useState(() => delayRender("checking sfx reachability", {timeoutInMilliseconds: 10000}));
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    (async () => {
      try {
        try {
          const response = await fetch(whoosh, {method: "HEAD"});
          setStatus(response.ok ? "reachable" : "blocked");
        } catch {
          setStatus("blocked");
        }
        continueRender(handle);
      } catch (err) {
        cancelRender(err);
      }
    })();
  }, [handle]);

  const line = (() => {
    switch (status) {
      case "checking":
        return "Checking remotion.media reachability…";
      case "reachable":
        return "Sound effects reachable — ready to <Audio src={whoosh} />";
      case "blocked":
        return "remotion.media blocked here — falls back gracefully";
    }
  })();

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/sfx · royalty-free sound effect URLs
      </div>
      <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, marginBottom: 32, maxWidth: 1100}}>
        {SOUNDS.map((sound) => (
          <div
            key={sound.name}
            style={{
              padding: "16px 28px",
              borderRadius: 12,
              background: palette.bgAlt,
              color: palette.text,
              fontSize: 24,
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            {sound.name}
          </div>
        ))}
      </div>
      <div style={{fontSize: 26, color: palette.text, textAlign: "center", maxWidth: 900, padding: "0 40px"}}>
        {line}
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.textDim, fontSize: 22}}>
        Each export is a plain URL — pass it straight to &lt;Audio src=&#123;...&#125; /&gt;
      </div>
    </AbsoluteFill>
  );
};
