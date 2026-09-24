import { SkiaCanvas } from "@remotion/skia";
import { zColor } from "@remotion/zod-types";
import { useFont } from "@shopify/react-native-skia";
import { staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { AssetManager } from "./AssetManager";
import { Drawing } from "./Drawing";

const roboto = staticFile("Roboto-Bold.ttf");

export const helloSkiaSchema = z.object({
  color1: zColor(),
  color2: zColor(),
});

export const HelloSkia: React.FC<z.infer<typeof helloSkiaSchema>> = ({
  color1,
  color2,
}) => {
  const { height, width } = useVideoConfig();

  const bigFont = useFont(roboto, 64);
  const smallFont = useFont(roboto, 30);

  if (bigFont === null || smallFont === null) {
    return null;
  }

  return (
    <SkiaCanvas height={height} width={width}>
      <AssetManager
        images={[]}
        typefaces={{
          Roboto: roboto,
        }}
      >
        <Drawing color1={color1} color2={color2} />
      </AssetManager>
    </SkiaCanvas>
  );
};
