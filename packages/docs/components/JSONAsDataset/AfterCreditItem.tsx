import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import Description from "./Description";
import SourceTypeComp from "./SourceType";
import type { AfterCreditType } from "./types";

type Props = {
  children?: JSX.Element | JSX.Element[];
};


const Single: React.FC<Props> = ({ children }) => {
  return <AbsoluteFill
    style={{
      display: 'flex',
      alignContent: 'center',
      justifyContent: 'center',
      justifyItems: "center",
    }}
  >
    <div style={{
      display: 'flex',
      alignContent: 'center',
      justifyContent: 'center',
      justifyItems: "center",

    }}>


      {children}
    </div>
  </AbsoluteFill>
}

const CreditItem: React.FC<AfterCreditType> = ({ name, source_type, metadata }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame + 10,
    durationInFrames: 25,
    config: {
      damping: 100
    }
  });


  return (

    <div style={{
      transform: `scale(${scale})`,
      backgroundColor: "white",
      height: '100px',
      margin: '10px',
      display: 'flex',
      paddingLeft: 50,
      paddingRight: 50,
      fontFamily: "Cubano",
      fontWeight: "bold",
      fontSize: '50px',
      borderRadius: '20px',
      justifyItems: 'center',
      alignItems: 'center',
    }}>
      <SourceTypeComp sourceType={source_type} />
      <Description name={name} metadata={metadata} />
    </div>



  )
}

const Main: React.FC<AfterCreditType> = (credit) => {

  if (credit.isSingle)
    return (
      <Single>
        <CreditItem {...credit} />
      </Single>
    )

  return (
    <CreditItem {...credit} />
  )

}

export default Main;
