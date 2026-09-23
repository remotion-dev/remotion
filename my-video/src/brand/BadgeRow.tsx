import {Img, staticFile} from "remotion";
import {brand} from "./theme";

// The owner's badges from public/badges/ on a white card: four of the five
// need a light background. Keep `height` at 160 or less, since the MFAA file
// is only 174×161. The tall, narrow awards badge gets 1.5× the height so its
// text stays readable. Animate the row as a whole; the badges are other
// organisations' marks and are never taken apart (see "Badges and logos" in
// AGENTS.md).
const BADGES = [
  {file: "badges/commbank-platinum-broker-2026-27.webp", alt: "CommBank Platinum Broker 2026/27", scale: 1},
  {file: "badges/mfaa-accredited-finance-broker.png", alt: "MFAA Accredited Finance Broker", scale: 1},
  {file: "badges/connective.png", alt: "Connective", scale: 0.8},
  {file: "badges/afca.png", alt: "AFCA", scale: 1},
  {file: "badges/small-business-champion-awards-2026-finalist.jpg", alt: "Australian Small Business Champion Awards 2026 finalist", scale: 1.5},
];

export const BadgeRow: React.FC<{height: number}> = ({height}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: height * 0.45,
      padding: `${height * 0.25}px ${height * 0.5}px`,
      borderRadius: 20,
      background: brand.card,
    }}
  >
    {BADGES.map((badge) => (
      <Img key={badge.file} src={staticFile(badge.file)} alt={badge.alt} style={{height: height * badge.scale, objectFit: "contain"}} />
    ))}
  </div>
);
