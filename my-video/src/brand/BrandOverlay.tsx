import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from "remotion";
import {z} from "zod";
import {useTyDoFont} from "../tydo/TyDoOverlays";
import {LowerThird} from "./LowerThird";

export const brandOverlaySchema = z.object({
  name: z.string(),
  roleVi: z.string(),
  roleEn: z.string(),
});

type BrandOverlayProps = z.infer<typeof brandOverlaySchema>;

export const brandOverlayDefaultProps: BrandOverlayProps = {
  name: "Daniel Nguyen",
  // The owner's banner: name, then "Mortgage Broker" alone.
  roleVi: "",
  roleEn: "Mortgage Broker",
};

const LOWER_THIRD_FROM = 30;
const LOWER_THIRD_DURATION = 150;
const FADE = 15;
// 2.5x the 78px TyDoReel uses, so the logo stands out in a corner.
const LOGO_HEIGHT = 195;

// A transparent overlay to lay over footage in a video editor: the Finance Hub
// logo on a white pill in the top-right corner for the whole clip (its
// "NETWORKS" is black, so it sits on white, as in TyDoReel), and the lower
// third from 1s to 6s. Nothing draws a background, so everything else stays
// see-through. The name and roles are props, editable in the Studio.
export const BrandOverlay: React.FC<BrandOverlayProps> = ({name, roleVi, roleEn}) => {
  useTyDoFont();
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
  const logoOpacity = interpolate(frame, [0, FADE, durationInFrames - FADE, durationInFrames], [0, 1, 1, 0], clamp);
  // LowerThird animates its own entrance; this fades it out before its
  // Sequence ends instead of cutting it off.
  const lowerThirdEnd = LOWER_THIRD_FROM + LOWER_THIRD_DURATION;
  const lowerThirdOpacity = interpolate(frame, [lowerThirdEnd - FADE, lowerThirdEnd], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 48,
          right: 48,
          padding: "22px 34px",
          borderRadius: 36,
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
          opacity: logoOpacity,
        }}
      >
        <Img src={staticFile("ty-do/finhub-logo.png")} style={{height: LOGO_HEIGHT, display: "block"}} />
      </div>
      <Sequence from={LOWER_THIRD_FROM} durationInFrames={LOWER_THIRD_DURATION} name="Lower third">
        <AbsoluteFill style={{opacity: lowerThirdOpacity}}>
          <LowerThird name={name} roleVi={roleVi} roleEn={roleEn} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// Makes a plain `npx remotion render BrandOverlay` write what editors import
// with transparency: ProRes 4444 with an alpha channel, from PNG frames.
export const calculateBrandOverlayMetadata: CalculateMetadataFunction<BrandOverlayProps> = ({compositionId}) => ({
  defaultCodec: "prores",
  defaultProResProfile: "4444",
  defaultPixelFormat: "yuva444p10le",
  defaultVideoImageFormat: "png",
  defaultOutName: compositionId === "BrandOverlayVertical" ? "brand-overlay-vertical" : "brand-overlay",
});
