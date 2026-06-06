import {outline, type OutlineMode} from '@remotion/effects/outline';
import React from 'react';
import {AbsoluteFill, CanvasImage} from 'remotion';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
<defs>
<linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
<stop offset="0" stop-color="#ff7a18"/>
<stop offset="1" stop-color="#af002d"/>
</linearGradient>
</defs>
<path d="M642 94c58 116 167 141 296 113-61 91-34 186 77 277-131-17-210 40-246 173-54-113-162-143-306-99 71-102 42-198-95-290 134 18 224-36 274-174z" fill="url(#g)"/>
<circle cx="418" cy="270" r="98" fill="#30d158"/>
<circle cx="825" cy="430" r="132" fill="#0a84ff" fill-opacity=".9"/>
</svg>`;

const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`;

export const EffectsOutlinePreview: React.FC<{
readonly width: number;
readonly color: string;
readonly opacity: number;
readonly sourceOpacity: number;
readonly backgroundColor: string;
readonly displacement: number;
readonly displacementFrequency: number;
readonly displacementSeed: number;
readonly simplification: number;
readonly mode: OutlineMode;
}> = ({
width,
color,
opacity,
sourceOpacity,
backgroundColor,
displacement,
displacementFrequency,
displacementSeed,
simplification,
mode,
}) => {
return (
<AbsoluteFill style={{backgroundColor: '#111827'}}>
<CanvasImage
src={src}
width={1280}
height={720}
fit="contain"
effects={[
outline({
width,
color,
opacity,
sourceOpacity,
backgroundColor,
displacement,
displacementFrequency,
displacementSeed,
simplification,
mode,
}),
]}
/>
</AbsoluteFill>
);
};
