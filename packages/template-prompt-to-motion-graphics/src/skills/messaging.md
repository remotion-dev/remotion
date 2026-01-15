---
title: Chat & Messaging UI
impact: HIGH
impactDescription: creates realistic chat interfaces with proper bubble styling and animations
tags: chat, messaging, whatsapp, imessage, bubbles, conversation
---

## Chat Bubble Layout

Use flexbox to align sent messages right, received messages left.

**Incorrect (all bubbles centered):**

```tsx
<div style={{ textAlign: "center" }}>
  {messages.map(msg => <div>{msg.text}</div>)}
</div>
```

**Correct (proper chat alignment):**

```tsx
<div style={{
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  padding: 40
}}>
  {messages.map((msg, i) => (
    <div style={{
      display: "flex",
      justifyContent: msg.sent ? "flex-end" : "flex-start",
      marginTop: 12
    }}>
      <div style={{
        maxWidth: "70%",
        padding: "12px 16px",
        borderRadius: 16,
        backgroundColor: msg.sent ? "#1f8a70" : "#202c33",
        color: "#e9edef"
      }}>
        {msg.text}
      </div>
    </div>
  ))}
</div>
```

## Staggered Message Entrances

Messages should appear one by one with slide + fade animations.

**Incorrect (all messages appear at once):**

```tsx
{messages.map(msg => <Bubble text={msg.text} />)}
```

**Correct (staggered with delays):**

```tsx
const STAGGER_DELAY = 38;
const FADE_DURATION = 18;

{messages.map((msg, i) => {
  const startFrame = i * STAGGER_DELAY;
  const opacity = interpolate(frame - startFrame, [0, FADE_DURATION], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slideX = interpolate(opacity, [0, 1], [msg.sent ? 40 : -40, 0]);

  return (
    <div style={{ opacity, transform: `translateX(${slideX}px)` }}>
      {msg.text}
    </div>
  );
})}
```

## Spring Bounce on Bubble Entrance

Add spring physics for organic bubble pop-in effect.

```tsx
const bounce = spring({
  frame: frame - startFrame,
  fps,
  config: { damping: 12, stiffness: 170 }
});
const scaleValue = interpolate(bounce, [0, 1], [0.98, 1]);

<div style={{
  transform: `translateX(${slideX}px) scale(${scaleValue})`,
  transformOrigin: msg.sent ? "100% 100%" : "0% 100%"
}}>
```

## Dark Theme Colors (WhatsApp style)

```tsx
const COLOR_BACKGROUND = "#0b141a";
const COLOR_SENT = "#1f8a70";      // Green for sent
const COLOR_RECEIVED = "#202c33"; // Dark gray for received
const COLOR_TEXT = "#e9edef";     // Light text
```

## Light Theme Colors (iMessage style)

```tsx
const COLOR_BACKGROUND = "#ffffff";
const COLOR_SENT = "#007AFF";     // Blue for sent
const COLOR_RECEIVED = "#E9E9EB"; // Light gray for received
const COLOR_TEXT_SENT = "#ffffff";
const COLOR_TEXT_RECEIVED = "#000000";
```

---

## COMPLETE EXAMPLE: WhatsApp-Style Chat

Prompt: "WhatsApp-style chat with messages appearing one by one"

```tsx
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, spring } from "remotion";

export const MyAnimation = () => {
  /*
   * Chat conversation with bubbles sliding in with spring animation.
   */
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const COLOR_BACKGROUND = "#0b141a";
  const COLOR_SENT = "#1f8a70";
  const COLOR_RECEIVED = "#202c33";
  const COLOR_TEXT = "#e9edef";

  const MSG_1 = "Hey, how are you?";
  const MSG_2 = "Great, thanks!";
  const MSG_3 = "Want to grab coffee?";

  const FONT_SIZE = 44;
  const FADE_DURATION = 18;
  const STAGGER_DELAY = 38;
  const SLIDE_DISTANCE = 40;
  const BOUNCE_DAMPING = 12;
  const BOUNCE_STIFFNESS = 170;
  const BUBBLE_RADIUS = 18;
  const BUBBLE_PADDING_X = 24;
  const BUBBLE_PADDING_Y = 18;
  const ROW_GAP = 22;
  const MAX_WIDTH_PERCENT = 72;

  const MSG1_START = 0;
  const MSG2_START = MSG1_START + FADE_DURATION + STAGGER_DELAY;
  const MSG3_START = MSG2_START + FADE_DURATION + STAGGER_DELAY;

  const MessageRow = ({text, align, start}: {text: string, align: string, start: number}) => {
    const local = frame - start;
    const opacity = interpolate(local, [0, FADE_DURATION], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
    const bounce = spring({frame: Math.max(0, local), fps, config: {damping: BOUNCE_DAMPING, stiffness: BOUNCE_STIFFNESS}});
    const scaleValue = interpolate(bounce, [0, 1], [0.98, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
    const xFrom = align === "right" ? SLIDE_DISTANCE : -SLIDE_DISTANCE;
    const tx = interpolate(opacity, [0, 1], [xFrom, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
    const bubbleBg = align === "right" ? COLOR_SENT : COLOR_RECEIVED;

    return (
      <div style={{width: "100%", display: "flex", justifyContent: align === "right" ? "flex-end" : "flex-start", marginTop: ROW_GAP}}>
        <div style={{
          maxWidth: `${MAX_WIDTH_PERCENT}%`,
          backgroundColor: bubbleBg,
          color: COLOR_TEXT,
          padding: `${BUBBLE_PADDING_Y}px ${BUBBLE_PADDING_X}px`,
          borderRadius: BUBBLE_RADIUS,
          fontSize: FONT_SIZE,
          fontFamily: "Inter, sans-serif",
          opacity,
          transform: `translateX(${tx}px) scale(${scaleValue})`,
          transformOrigin: align === "right" ? "100% 100%" : "0% 100%"
        }}>
          {text}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{
      backgroundColor: COLOR_BACKGROUND,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: Math.max(36, Math.round(width * 0.04)),
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{flex: 1}} />
      <MessageRow text={MSG_1} align="left" start={MSG1_START} />
      <MessageRow text={MSG_2} align="right" start={MSG2_START} />
      <MessageRow text={MSG_3} align="left" start={MSG3_START} />
      <div style={{height: Math.max(20, Math.round(height * 0.02))}} />
    </AbsoluteFill>
  );
};
```
