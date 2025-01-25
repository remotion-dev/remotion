import {makeMatrix3dTransform} from '@remotion/svg-3d-engine';
import React from 'react';
import {DivExtrusion} from './DivExtrusion';
import {Face} from './FrontFace';
import {RectProvider} from './path-context';
import {useTransformations} from './transformation-context';
import {isBacksideVisible} from './viewing-frontside';

export const ExtrudeDiv: React.FC<{
	readonly children: React.ReactNode;
	readonly width: number;
	readonly height: number;
	readonly depth: number;
	readonly cornerRadius: number;
	readonly backFace?: React.ReactNode;
	readonly style?: React.CSSProperties;
}> = ({children, width, height, depth, cornerRadius, backFace, style}) => {
	const frontFace = isBacksideVisible(useTransformations());

	return (
		<RectProvider height={height} width={width} cornerRadius={cornerRadius}>
			<div
				style={{
					width,
					height,
					position: 'relative',
					...style,
				}}
			>
				{depth > 0 ? <DivExtrusion depth={depth} /> : children}
				{depth === 0 ? null : !frontFace ? (
					<Face type="front" depth={depth}>
						{children}
					</Face>
				) : (
					<Face type="back" depth={depth}>
						{backFace}
					</Face>
				)}
			</div>
		</RectProvider>
	);
};

export const ThreeDPlane: React.FC<{
	readonly children: React.ReactNode;
	readonly width: number;
	readonly height: number;
	readonly cornerRadius: number;
	readonly style?: React.CSSProperties;
}> = ({children, width, height, cornerRadius, style}) => {
	return (
		<RectProvider height={height} width={width} cornerRadius={cornerRadius}>
			<div
				style={{
					width,
					height,
					position: 'relative',
					transform: makeMatrix3dTransform(useTransformations()),
					...style,
				}}
			>
				{children}
			</div>
		</RectProvider>
	);
};
