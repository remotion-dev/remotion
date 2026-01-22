import { textRotationExample } from "./text-rotation";
import { histogramExample } from "./histogram";
import { progressBarExample } from "./progress-bar";
import { animatedShapesExample } from "./animated-shapes";
import { lottieAnimationExample } from "./lottie-animation";
import { fallingSpheresExample } from "./falling-spheres";
import { goldPriceChartExample } from "./gold-price-chart";
import { typewriterHighlightExample } from "./typewriter-highlight";
import { wordCarouselExample } from "./word-carousel";

export interface RemotionExample {
  id: string;
  name: string;
  description: string;
  code: string;
  durationInFrames: number;
  fps: number;
  category: "Text" | "Charts" | "Animation" | "3D" | "Other";
}

export const examples: RemotionExample[] = [
  textRotationExample,
  histogramExample,
  progressBarExample,
  animatedShapesExample,
  lottieAnimationExample,
  fallingSpheresExample,
  goldPriceChartExample,
  typewriterHighlightExample,
  wordCarouselExample,
];

export function getExampleById(id: string): RemotionExample | undefined {
  return examples.find((e) => e.id === id);
}

export function getExamplesByCategory(
  category: RemotionExample["category"],
): RemotionExample[] {
  return examples.filter((e) => e.category === category);
}
