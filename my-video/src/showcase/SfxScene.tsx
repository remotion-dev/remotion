import {
  animeWow,
  boneCrack,
  bruh,
  ding,
  dramaticBoomer,
  fah,
  illuminatiConfirmed,
  loadingLag,
  macQuack,
  minecraftHurt,
  mouseClick,
  nellyAhh,
  ohMyGodVine,
  omgHellNah,
  pageTurn,
  priceIsRightFail,
  recordScratch,
  romanceMeme,
  sanctuaryGuardianWhat,
  shutterModern,
  shutterOld,
  skedaddle,
  snapchatNotification,
  spongebobFail,
  triggered,
  uiSwitch,
  vineBoom,
  whip,
  whoosh,
  wilhelmScream,
  windowsXpError,
  yippee,
} from "@remotion/sfx";
import {useEffect, useState} from "react";
import {AbsoluteFill, cancelRender, continueRender, delayRender, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

type Status = "checking" | "reachable" | "blocked";

// The full catalog -- every @remotion/sfx export. Each is just a plain
// `https://remotion.media/*.wav` string constant.
const SOUNDS = [
  {name: "whoosh", url: whoosh},
  {name: "ding", url: ding},
  {name: "vineBoom", url: vineBoom},
  {name: "pageTurn", url: pageTurn},
  {name: "mouseClick", url: mouseClick},
  {name: "recordScratch", url: recordScratch},
  {name: "whip", url: whip},
  {name: "uiSwitch", url: uiSwitch},
  {name: "shutterModern", url: shutterModern},
  {name: "shutterOld", url: shutterOld},
  {name: "bruh", url: bruh},
  {name: "windowsXpError", url: windowsXpError},
  {name: "fah", url: fah},
  {name: "spongebobFail", url: spongebobFail},
  {name: "omgHellNah", url: omgHellNah},
  {name: "priceIsRightFail", url: priceIsRightFail},
  {name: "romanceMeme", url: romanceMeme},
  {name: "boneCrack", url: boneCrack},
  {name: "animeWow", url: animeWow},
  {name: "yippee", url: yippee},
  {name: "loadingLag", url: loadingLag},
  {name: "wilhelmScream", url: wilhelmScream},
  {name: "macQuack", url: macQuack},
  {name: "skedaddle", url: skedaddle},
  {name: "snapchatNotification", url: snapchatNotification},
  {name: "nellyAhh", url: nellyAhh},
  {name: "sanctuaryGuardianWhat", url: sanctuaryGuardianWhat},
  {name: "minecraftHurt", url: minecraftHurt},
  {name: "ohMyGodVine", url: ohMyGodVine},
  {name: "illuminatiConfirmed", url: illuminatiConfirmed},
  {name: "dramaticBoomer", url: dramaticBoomer},
  {name: "triggered", url: triggered},
];

// Demonstrates: @remotion/sfx's full catalog -- every export, all 32 of
// them, a curated library of royalty-free sound effect URLs (each is just a
// `https://remotion.media/*.wav` string, meant to be passed straight to
// <Audio src={...}> from @remotion/media). The exports themselves need no
// network access to import and use in code -- only *playing* the actual
// audio does, and remotion.media is the same host that blocks
// @remotion/video-matting's/whisper-webgpu's model downloads in this
// sandbox (see AGENTS.md), so this checks reachability honestly rather
// than assuming success, the same pattern as those scenes.
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
      <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 20, maxWidth: 1180}}>
        {SOUNDS.map((sound) => (
          <div
            key={sound.name}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: palette.bgAlt,
              color: palette.text,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            {sound.name}
          </div>
        ))}
      </div>
      <div style={{fontSize: 24, color: palette.text, textAlign: "center", maxWidth: 900, padding: "0 40px"}}>
        {line}
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.textDim, fontSize: 22}}>
        Each export is a plain URL — pass it straight to &lt;Audio src=&#123;...&#125; /&gt;
      </div>
    </AbsoluteFill>
  );
};
