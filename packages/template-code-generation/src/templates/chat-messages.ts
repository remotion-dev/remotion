import { RemotionExample } from "./index";

export const chatMessagesCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const messages = [
    { text: "Hey! How are you?", isMe: false, delay: 0 },
    { text: "I'm good! Working on Remotion", isMe: true, delay: 45 },
    { text: "That's awesome! Show me!", isMe: false, delay: 90 },
    { text: "Check this out!", isMe: true, delay: 135 },
  ];

  const visibleMessages = messages.filter((msg) => frame >= msg.delay);
  const messageHeight = 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        padding: 60,
        justifyContent: "flex-end",
        paddingBottom: 80,
      }}
    >
      <div style={{ width: "100%", position: "relative" }}>
        {messages.map((msg, i) => {
          const progress = spring({
            frame: frame - msg.delay,
            fps,
            config: { damping: 12, stiffness: 200 },
          });

          if (frame < msg.delay) return null;

          const messagesAfter = messages.filter((m, idx) => idx > i && frame >= m.delay).length;
          const yOffset = messagesAfter * messageHeight;

          const xOffset = msg.isMe ? (1 - progress) * 100 : (1 - progress) * -100;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.isMe ? "flex-end" : "flex-start",
                marginBottom: 24,
                opacity: progress,
                transform: \`translateX(\${xOffset}px) translateY(\${-yOffset}px) scale(\${0.8 + progress * 0.2})\`,
              }}
            >
              <div
                style={{
                  backgroundColor: msg.isMe ? "#25D366" : "#2a2a2a",
                  color: "#fff",
                  padding: "20px 28px",
                  borderRadius: 24,
                  fontSize: 42,
                  fontFamily: "system-ui, sans-serif",
                  maxWidth: "70%",
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`;

export const chatMessagesExample: RemotionExample = {
  id: "chat-messages",
  name: "Chat Messages",
  description: "WhatsApp-style bouncy message bubbles",
  category: "Text",
  durationInFrames: 180,
  fps: 30,
  code: chatMessagesCode,
};
