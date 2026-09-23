import {ThreeCanvas} from "@remotion/three";
import {useEffect, useState} from "react";
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {FontLoader, type Font} from "three-stdlib";
import {palette} from "./palette";
import {poppins} from "./font";
import {ThreeTextMesh} from "./ThreeTextMesh";

// A second, genuinely different @remotion/three technique from ThreeScene:
// real extruded 3D typography, adapted from Remotion's own
// remotion-dev/3d-text template (github.com/remotion-dev/3d-text).
// FontLoader parses a self-hosted three.js typeface JSON
// (public/rubik-bold-typeface.json -- Rubik Bold, OFL-licensed) into a Font;
// TextGeometry then extrudes each character into real 3D geometry via
// @react-three/fiber's extend(). Both come from three-stdlib rather than
// three's own `examples/jsm` addons -- the installed `three` version ships
// no type declarations for those paths at all, while three-stdlib is a
// typed, actively maintained re-export of the same loaders/geometries and
// the standard companion package for @react-three/fiber projects.
// <ThreeCanvas>'s `orthographic` and `linear` props are exercised here for
// the first time (ThreeScene uses the default perspective camera).
export const ThreeTextScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const [handle] = useState(() => delayRender("loading Rubik Bold three.js typeface"));
  const [font, setFont] = useState<Font | null>(null);

  useEffect(() => {
    new FontLoader()
      .loadAsync(staticFile("rubik-bold-typeface.json"))
      .then((loadedFont) => {
        setFont(loadedFont);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle]);

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26, zIndex: 1}}>
        @remotion/three · extruded 3D typography (TextGeometry + FontLoader)
      </div>
      {font ? (
        <ThreeCanvas
          orthographic
          linear
          width={1280}
          height={720}
          style={{backgroundColor: palette.bg}}
          camera={{zoom: 55, near: -40}}
        >
          <ThreeTextMesh position={2} frame={frame} fps={fps} text="Remotion" font={font} />
          <ThreeTextMesh position={-0.5} frame={frame - 5} fps={fps} text="in" font={font} />
          <ThreeTextMesh position={-3} frame={frame - 10} fps={fps} text="3D" font={font} />
        </ThreeCanvas>
      ) : null}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          width,
          textAlign: "center",
          color: palette.text,
          fontSize: 32,
          fontWeight: 600,
          zIndex: 1,
        }}
      >
        TextGeometry · FontLoader · extend()
      </div>
    </AbsoluteFill>
  );
};
