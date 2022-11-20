import React from "react";
import { AbsoluteFill } from "remotion";
import data from "./creditsdata.json";
import { CreditsList } from "./AfterCreditList";
import AfterCreditItem from "./AfterCreditItem";

import { getFont } from './utils';
getFont();


const JSONAsDataset: React.FC = () => {
  return (
    <AbsoluteFill>
      <CreditsList credits={data} />
    </AbsoluteFill>
  )
}


export {AfterCreditItem, JSONAsDataset}