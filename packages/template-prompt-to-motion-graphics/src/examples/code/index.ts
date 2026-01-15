import { textRotationExample } from "./text-rotation";
import { chatMessagesExample } from "./chat-messages";
import { counterAnimationExample } from "./counter-animation";
import { histogramExample } from "./histogram";
import { progressBarExample } from "./progress-bar";
import { animatedShapesExample } from "./animated-shapes";
import { morphingHexagonsExample } from "./morphing-hexagons";
import { lottieAnimationExample } from "./lottie-animation";
import { fallingSpheresExample } from "./falling-spheres";
import { goldPriceChartExample } from "./gold-price-chart";
import { typewriterHighlightExample } from "./typewriter-highlight";
import { wordCarouselExample } from "./word-carousel";
import { staggeredListExample } from "./staggered-list";

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
  chatMessagesExample,
  counterAnimationExample,
  histogramExample,
  progressBarExample,
  animatedShapesExample,
  morphingHexagonsExample,
  lottieAnimationExample,
  fallingSpheresExample,
  goldPriceChartExample,
  typewriterHighlightExample,
  wordCarouselExample,
  staggeredListExample,
];

export function getExampleById(id: string): RemotionExample | undefined {
  return examples.find((e) => e.id === id);
}

export function getExamplesByCategory(
  category: RemotionExample["category"],
): RemotionExample[] {
  return examples.filter((e) => e.category === category);
}
