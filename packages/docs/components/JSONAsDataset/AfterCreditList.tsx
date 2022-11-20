import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BACKGROUND } from "./utils";
import CreditItem from "./AfterCreditItem";
import CreditTitle from "./AfterCreditTitle";
import type { AfterCreditType } from "./types";


const CreditsList: React.FC<{
  credits: Array<AfterCreditType>
}> = ({
  credits
}) => {
    const frame = useCurrentFrame();

    const value = interpolate(frame, [1, (credits.length - 1) * 4], [0, credits.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    })

    const theCredits = credits.slice(0, value);

    return (
      <AbsoluteFill style={{
        display: 'flex',
        background: BACKGROUND,
        padding: '50px',
      }}>
        <CreditTitle />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          background: BACKGROUND,
          padding: '50px',
          justifyContent: 'center',
          justifyItems: 'center',
          flexFlow: 'wrap',
        }}>
          {theCredits.map((item, index) => <CreditItem key={`${item.name}-${index}`} {...item} />)}
        </div>
      </AbsoluteFill>

    )
  }

export { CreditsList }