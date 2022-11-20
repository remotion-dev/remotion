import React from "react";
import { AbsoluteFill } from "remotion";
import data from "./creditsdata.json";
import { CreditsList } from "./components/AfterCreditList";
import { getFont } from './utils';
getFont();


export const JSONAsDataset: React.FC = () => {
  return (
    <AbsoluteFill>
      <CreditsList credits={data} />
    </AbsoluteFill>
  )
}
