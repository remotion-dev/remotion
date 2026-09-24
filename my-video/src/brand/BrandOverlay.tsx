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
  roleVi: "Chuyên viên tư vấn vay",
  roleEn: "Mortgage Broker · Finance Hub",
};

const LOWER_THIRD_FROM = 30;
const LOWER_THIRD_DURATION = 150;
const FADE = 15;
// 2.5x the 78px TyDoReel uses, so the logo stands out in a corner.
const LOGO_HEIGHT = 195;

// A transparent overlay to lay over footage in a video editor: the Finance Hub
// logo in the top-right corner for the whole clip, straight on the footage
// with no backing (its "NETWORKS" is black, so it reads best over light or
// mid-tone footage), and the lower third from 1s to 6s. Nothing draws a background, so everything else stays
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
      <Img src={staticFile("ty-do/finhub-logo.png")} style={{position: "absolute", top: 48, right: 48, height: LOGO_HEIGHT, opacity: logoOpacity}} />
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
