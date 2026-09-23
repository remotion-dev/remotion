import {Img, staticFile} from "remotion";
import {brand} from "./theme";

// The lenders the owner is accredited with, from public/lenders/, on a white
// card (CommBank's wordmark is black and St.George's file has a white
// background; NAB and Bankwest are their own dark versions, so they show as
// dark tiles). Keep `height` at 100 or less: firstmac.png is only 102px tall.
// `scale` evens out the logos' shapes.
// Add a lender here when its logo is saved (see "Lender logos" in AGENTS.md).
const LENDERS = [
  {file: "lenders/commbank.png", alt: "CommBank", scale: 1.3},
  {file: "lenders/anz.webp", alt: "ANZ", scale: 0.9},
  {file: "lenders/nab.png", alt: "NAB", scale: 0.8},
  {file: "lenders/st-george.png", alt: "St.George", scale: 1.3},
  {file: "lenders/bankwest.png", alt: "Bankwest", scale: 0.8},
  {file: "lenders/firstmac.png", alt: "firstmac", scale: 0.8},
];

export const LenderRow: React.FC<{height: number}> = ({height}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: height * 0.6,
      padding: `${height * 0.25}px ${height * 0.5}px`,
      borderRadius: 20,
      background: brand.card,
    }}
  >
    {LENDERS.map((lender) => (
      <Img key={lender.file} src={staticFile(lender.file)} alt={lender.alt} style={{height: height * lender.scale, objectFit: "contain"}} />
    ))}
  </div>
);
