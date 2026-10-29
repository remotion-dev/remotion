import React from 'react';
import {Interactive, interpolate, useCurrentFrame, useVideoConfig, type InteractiveTransformProps} from 'remotion';
const OfferLowerThirdInner: React.FC<InteractiveTransformProps> = ({style}) => {
 const frame = useCurrentFrame();
 const {durationInFrames} = useVideoConfig();
 const transitionFrames = Math.min(12, Math.max(1, Math.floor(durationInFrames / 3)));
 const reveal = interpolate(frame, [0, transitionFrames, durationInFrames-transitionFrames, durationInFrames], [0,1,1,0], {extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <Interactive.Div name="Offer" showInTimeline={false} style={{display:'flex',alignItems:'center',gap:24,width:780,height:132,padding:24,boxSizing:'border-box',backgroundColor:'#142c38',color:'#ffffff',borderRadius:16,fontFamily:'Arial, sans-serif',...style}}>
  <Interactive.Div name="Reveal" showInTimeline={false} style={{display:'flex',alignItems:'center',gap:24,width:'100%',opacity:reveal,clipPath:`inset(0 ${(1-reveal)*100}% 0 0)`}}>
   <Interactive.Div name="Product" style={{display:'flex',flexDirection:'column',gap:8,flex:1}}>
    <Interactive.Div name="Product name" style={{fontSize:22,fontWeight:600}}>Everyday bottle</Interactive.Div>
    <Interactive.Div name="Price" style={{fontSize:38,fontWeight:700,lineHeight:1}}>$29</Interactive.Div>
   </Interactive.Div>
   <Interactive.Div name="Call to action" style={{backgroundColor:'#ffffff',color:'#142c38',borderRadius:8,padding:'16px 24px',fontSize:24,fontWeight:700}}>Shop collection</Interactive.Div>
  </Interactive.Div>
 </Interactive.Div>;
};
export const OfferLowerThird = Interactive.create({Component:OfferLowerThirdInner,componentName:'<OfferLowerThird>'});
