import { CharacterAlignmentResponseModel } from "@elevenlabs/elevenlabs-js/api";
import { z } from "zod";

const BackgroundTransitionTypeSchema = z.union([
  z.literal("fade"),
  z.literal("blur"),
  z.literal("none"),
]);

const TimelineElementSchema = z.object({
  startMs: z.number(),
  endMs: z.number(),
});

const ElementAnimationSchema = TimelineElementSchema.extend({
  type: z.literal("scale"),
  from: z.number(),
  to: z.number(),
});

const BackgroundElementSchema = TimelineElementSchema.extend({
  imageUrl: z.string(),
  enterTransition: BackgroundTransitionTypeSchema.optional(),
  exitTransition: BackgroundTransitionTypeSchema.optional(),
  animations: z.array(ElementAnimationSchema).optional(),
});

const TextElementSchema = TimelineElementSchema.extend({
  text: z.string(),
  position: z.union([
    z.literal("top"),
    z.literal("bottom"),
    z.literal("center"),
  ]),
  animations: z.array(ElementAnimationSchema).optional(),
});

const AudioElementSchema = TimelineElementSchema.extend({
  audioUrl: z.string(),
});

const TimelineSchema = z.object({
  shortTitle: z.string(),
  elements: z.array(BackgroundElementSchema),
  text: z.array(TextElementSchema),
  audio: z.array(AudioElementSchema),
});

export type BackgroundTransitionType = z.infer<
  typeof BackgroundTransitionTypeSchema
>;

export type TimelineElement = z.infer<typeof TimelineElementSchema>;
export type ElementAnimation = z.infer<typeof ElementAnimationSchema>;
export type BackgroundElement = z.infer<typeof BackgroundElementSchema>;
export type TextElement = z.infer<typeof TextElementSchema>;
export type AudioElement = z.infer<typeof AudioElementSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;

export {
  BackgroundTransitionTypeSchema,
  TimelineElementSchema,
  ElementAnimationSchema,
  BackgroundElementSchema,
  TextElementSchema,
  AudioElementSchema,
  TimelineSchema,
};

export const StoryScript = z.object({
  text: z.string(),
});

export const StoryWithImages = z.object({
  result: z.array(
    z.object({
      text: z.string(),
      imageDescription: z.string(),
    }),
  ),
});

export const VoiceDescriptorSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type VoiceDescriptor = z.infer<typeof VoiceDescriptorSchema>;

export interface StoryMetadataWithDetails {
  shortTitle: string;
  content: ContentItemWithDetails[];
}

export interface ContentItemWithDetails {
  text: string;
  imageDescription: string;
  uid: string;
  audioTimestamps: CharacterAlignmentResponseModel;
}
