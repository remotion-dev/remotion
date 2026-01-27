import { streamText, generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import {
  getCombinedSkillContent,
  SKILL_DETECTION_PROMPT,
  SKILL_NAMES,
  type SkillName,
} from "@/skills";

const VALIDATION_PROMPT = `You are a prompt classifier for a motion graphics generation tool.

Determine if the user's prompt is asking for motion graphics/animation content that can be created as a React/Remotion component.

VALID prompts include requests for:
- Animated text, titles, or typography
- Data visualizations (charts, graphs, progress bars)
- UI animations (buttons, cards, transitions)
- Logo animations or brand intros
- Social media content (stories, reels, posts)
- Explainer animations
- Kinetic typography
- Abstract motion graphics
- Animated illustrations
- Product showcases
- Countdown timers
- Loading animations
- Any visual/animated content

INVALID prompts include:
- Questions (e.g., "What is 2+2?", "How do I...")
- Requests for text/written content (poems, essays, stories, code explanations)
- Conversations or chat
- Non-visual tasks (calculations, translations, summaries)
- Requests completely unrelated to visual content

Return true if the prompt is valid for motion graphics generation, false otherwise.`;

const SYSTEM_PROMPT = `
You are an expert in generating React components for Remotion animations.

## COMPONENT STRUCTURE

1. Start with ES6 imports
2. Export as: export const MyAnimation = () => { ... };
3. Component body order:
   - Multi-line comment description (2-3 sentences)
   - Hooks (useCurrentFrame, useVideoConfig, etc.)
   - Constants (COLORS, TEXT, TIMING, LAYOUT) - all UPPER_SNAKE_CASE
   - Calculations and derived values
   - return JSX

## CONSTANTS RULES (CRITICAL)

ALL constants MUST be defined INSIDE the component body, AFTER hooks:
- Colors: const COLOR_TEXT = "#000000";
- Text: const TITLE_TEXT = "Hello World";
- Timing: const FADE_DURATION = 20;
- Layout: const PADDING = 40;

This allows users to easily customize the animation.

## LAYOUT RULES

- Use full width of container with appropriate padding
- Never constrain content to a small centered box
- Use Math.max(minValue, Math.round(width * percentage)) for responsive sizing

## ANIMATION RULES

- Prefer spring() for organic motion (entrances, bounces, scaling)
- Use interpolate() for linear progress (progress bars, opacity fades)
- Always use { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
- Add stagger delays for multiple elements

## AVAILABLE IMPORTS

\`\`\`tsx
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, spring, Sequence } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Circle, Rect, Triangle, Star, Ellipse, Pie } from "@remotion/shapes";
import { ThreeCanvas } from "@remotion/three";
import { useState, useEffect } from "react";
\`\`\`

## RESERVED NAMES (CRITICAL)

NEVER use these as variable names - they shadow imports:
- spring, interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill, Sequence

## STYLING RULES

- Use inline styles only
- ALWAYS use fontFamily: 'Inter, sans-serif'
- Keep colors minimal (2-4 max)
- ALWAYS set backgroundColor on AbsoluteFill from frame 0 - never fade in backgrounds

## OUTPUT FORMAT (CRITICAL)

- Output ONLY code - no explanations, no questions
- Response must start with "import" and end with "};"
- If prompt is ambiguous, make a reasonable choice - do not ask for clarification

`;

const FOLLOW_UP_PROMPT_ADDITION = `

## FOLLOW-UP EDIT MODE

You are refining an existing animation component. The user has provided:
1. The current code (which may include their manual edits)
2. Their new request for changes

CRITICAL RULES FOR FOLLOW-UP EDITS:
- Preserve the overall structure and working parts of the existing code
- Only modify what the user specifically asks to change
- Keep existing variable names, colors, and timing unless asked to change them
- If the user made manual edits, incorporate and respect those changes
- Never start from scratch unless explicitly asked
- Maintain existing imports and only add new ones if needed
- Output the COMPLETE updated code, not just the changed parts
`;

interface ConversationContextMessage {
  role: "user" | "assistant";
  content: string;
}

interface GenerateRequest {
  prompt: string;
  model?: string;
  currentCode?: string;
  conversationHistory?: ConversationContextMessage[];
  isFollowUp?: boolean;
  hasManualEdits?: boolean;
}

export async function POST(req: Request) {
  const {
    prompt,
    model = "gpt-5-mini",
    currentCode,
    conversationHistory = [],
    isFollowUp = false,
    hasManualEdits = false,
  }: GenerateRequest = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          'The environment variable "OPENAI_API_KEY" is not set. Add it to your .env file and try again.',
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Parse model ID - format can be "model-name" or "model-name:reasoning_effort"
  const [modelName, reasoningEffort] = model.split(":");

  const openai = createOpenAI({ apiKey });

  // Validate the prompt first (skip for follow-ups with existing code)
  if (!isFollowUp) {
    try {
      const validationResult = await generateObject({
        model: openai("gpt-5.2"),
        system: VALIDATION_PROMPT,
        prompt: `User prompt: "${prompt}"`,
        schema: z.object({ valid: z.boolean() }),
      });

      if (!validationResult.object.valid) {
        return new Response(
          JSON.stringify({
            error:
              "No valid motion graphics prompt. Please describe an animation or visual content you'd like to create.",
            type: "validation",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
    } catch (validationError) {
      // On validation error, allow through rather than blocking
      console.error("Validation error:", validationError);
    }
  }

  // Detect which skills apply to this prompt
  let detectedSkills: SkillName[] = [];
  try {
    const skillResult = await generateObject({
      model: openai("gpt-5.2"),
      system: SKILL_DETECTION_PROMPT,
      prompt: `User prompt: "${prompt}"`,
      schema: z.object({
        skills: z.array(z.enum(SKILL_NAMES)),
      }),
    });
    detectedSkills = skillResult.object.skills;
    console.log("Detected skills:", detectedSkills);
  } catch (skillError) {
    console.error("Skill detection error:", skillError);
  }

  // Load skill-specific content and enhance the system prompt
  const skillContent = getCombinedSkillContent(detectedSkills);
  let enhancedSystemPrompt = skillContent
    ? `${SYSTEM_PROMPT}\n\n## SKILL-SPECIFIC GUIDANCE\n${skillContent}`
    : SYSTEM_PROMPT;

  // Add follow-up mode instructions if applicable
  if (isFollowUp && currentCode) {
    enhancedSystemPrompt += FOLLOW_UP_PROMPT_ADDITION;
  }

  // Build the full prompt with context for follow-up edits
  let fullPrompt = prompt;

  if (isFollowUp && currentCode) {
    // Include conversation context (last 3 exchanges)
    const contextMessages = conversationHistory.slice(-6);
    let conversationContext = "";
    if (contextMessages.length > 0) {
      conversationContext =
        "\n\n## RECENT CONVERSATION:\n" +
        contextMessages
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n");
    }

    // Include manual edit notice
    const manualEditNotice = hasManualEdits
      ? "\n\nNOTE: The user has made manual edits to the code. Preserve these changes while applying the new request."
      : "";

    fullPrompt = `## CURRENT CODE:
\`\`\`tsx
${currentCode}
\`\`\`
${conversationContext}
${manualEditNotice}

## USER REQUEST:
${prompt}

Please modify the existing code according to the user's request. Output only the complete updated code.`;
  }

  try {
    const result = streamText({
      model: openai(modelName),
      system: enhancedSystemPrompt,
      prompt: fullPrompt,
      ...(reasoningEffort && {
        providerOptions: {
          openai: {
            reasoningEffort: reasoningEffort,
          },
        },
      }),
    });

    console.log(
      "Generating React component with prompt:",
      prompt,
      "model:",
      modelName,
      "skills:",
      detectedSkills.length > 0 ? detectedSkills.join(", ") : "general",
      "isFollowUp:",
      isFollowUp,
      reasoningEffort ? `reasoning_effort: ${reasoningEffort}` : "",
    );

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Error generating code:", error);
    return new Response(
      JSON.stringify({
        error: "Something went wrong while trying to reach OpenAI APIs.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
