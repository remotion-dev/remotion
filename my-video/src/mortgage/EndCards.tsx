// The two closing cards of every MortgageReel: CTA/contact with the credential
// badges, then the fixed compliance card.
import type React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BadgeRow } from "../brand/BadgeRow";
import { brand } from "../brand/theme";
import {
  CONDITIONS_NOTE_VI,
  CREDIT_REP_STATEMENT,
  DISCLAIMER_EN,
  DISCLAIMER_VI,
  LICENSING_STATEMENT,
  comparisonWarningVi,
} from "./compliance";
import { CTA_BUTTON, type EditJson } from "./schema";
import { FONT, LOGO, clamp, enter } from "./style";

// ---------------------------------------------------------------- CTA / contact

export const Outro: React.FC<{ question: string }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = enter(frame, fps, 4);
  const b = enter(frame, fps, 14);
  const c = enter(frame, fps, 26);
  const d = enter(frame, fps, 38);
  const e = enter(frame, fps, 48);
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  const contact = (label: string, value: string) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 30,
        padding: "14px 0",
        borderTop: `2px solid ${brand.primary}22`,
      }}
    >
      <span style={{ color: "#5B6B80", fontWeight: 600 }}>{label}</span>
      <span style={{ color: brand.textOnCard, fontWeight: 800 }}>{value}</span>
    </div>
  );
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #EEF5FB 100%)",
        alignItems: "center",
        fontFamily: FONT,
        textAlign: "center",
        padding: "150px 80px 0",
      }}
    >
      <Img
        src={LOGO}
        style={{ width: 720, transform: `scale(${a})`, opacity: a }}
      />
      <div
        style={{
          marginTop: 60,
          fontSize: 62,
          fontWeight: 900,
          color: brand.textOnCard,
          lineHeight: 1.25,
          opacity: b,
          transform: `translateY(${interpolate(b, [0, 1], [40, 0])}px)`,
        }}
      >
        {question}
      </div>
      <div
        style={{
          marginTop: 46,
          padding: "26px 60px",
          borderRadius: 999,
          background: brand.primary,
          color: "#fff",
          fontSize: 54,
          fontWeight: 900,
          opacity: c,
          transform: `scale(${c * pulse})`,
          boxShadow: "0 16px 40px rgba(0,100,168,0.35)",
        }}
      >
        {CTA_BUTTON}
      </div>
      <div
        style={{
          marginTop: 50,
          width: 860,
          fontSize: 44,
          opacity: d,
          transform: `translateY(${interpolate(d, [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            color: brand.primary,
            marginBottom: 10,
          }}
        >
          Daniel Nguyen
        </div>
        {contact("Điện thoại", "0430 11 11 88")}
        {contact("Email", "daniel@finhub.net.au")}
        {contact("Website", "finhub.net.au")}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 90,
          opacity: e,
          transform: `translateY(${interpolate(e, [0, 1], [60, 0])}px)`,
          boxShadow: "0 10px 30px rgba(11,31,61,0.15)",
          borderRadius: 20,
        }}
      >
        <BadgeRow height={90} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- compliance

// Mandatory disclosures under Finance Hub's own ACL, from compliance.ts. Fixed,
// static and as bold as the rest of the ad (disclosures must be as prominent as
// the advert's main content). Not editable per video beyond which notes apply.
export const ComplianceCard: React.FC<{
  compliance: EditJson["compliance"];
}> = ({ compliance }) => {
  const frame = useCurrentFrame();
  const [company, ...licence] = LICENSING_STATEMENT.split(" | ");
  const rate = compliance?.advertisedRate;
  const lines: { text: string; base: number; color?: string }[] = [
    { text: company, base: 50, color: brand.primary },
    { text: licence.join(" | "), base: 44 },
    ...(rate
      ? [
          {
            text: `Lãi suất ${rate.rateFigure} | Lãi suất so sánh ${rate.comparisonRate}`,
            base: 44,
            color: brand.primary,
          },
        ]
      : []),
    { text: CREDIT_REP_STATEMENT, base: 44 },
    { text: DISCLAIMER_EN, base: 44 },
    { text: DISCLAIMER_VI, base: 42 },
    ...(compliance?.illustrativeNumbers === false
      ? []
      : [
          {
            text: "Các con số trong video chỉ là ví dụ minh hoạ, không phải đề nghị lãi suất. Examples are illustrative only.",
            base: 38,
            color: "#33445A",
          },
        ]),
    ...(compliance?.conditionsNote
      ? [{ text: CONDITIONS_NOTE_VI, base: 38, color: "#33445A" }]
      : []),
    ...(rate
      ? [{ text: comparisonWarningVi(rate.ratesAsAt), base: 34, color: "#33445A" }]
      : []),
  ];
  // ponytail: text-fit by an area estimate (glyph ≈0.55em wide, 1.35 line
  // height, 920px column, ~1300px of height); swap for @remotion/layout-utils
  // fitText if a card ever overflows.
  const chars = lines.reduce((n, l) => n + l.text.length, 0);
  const fit = Math.sqrt(((1300 - 34 * lines.length) * 920) / (chars * 0.7425));
  const k = Math.min(1, fit / 44);
  return (
    <AbsoluteFill
      style={{
        background: "#FFFFFF",
        fontFamily: FONT,
        padding: "140px 80px 0",
        alignItems: "center",
        textAlign: "center",
        opacity: interpolate(frame, [0, 8], [0, 1], clamp),
      }}
    >
      <Img src={LOGO} style={{ width: 420 }} />
      {lines.map((l) => (
        <div
          key={l.text}
          style={{
            fontSize: Math.round(l.base * k),
            fontWeight: 800,
            color: l.color ?? brand.textOnCard,
            lineHeight: 1.35,
            marginTop: 34 * k,
          }}
        >
          {l.text}
        </div>
      ))}
    </AbsoluteFill>
  );
};

