import {makeMatrix3dTransform} from '@remotion/svg-3d-engine';
import React from 'react';
import {DivExtrusion} from './DivExtrusion';
import {Face} from './FrontFace';
import {RectProvider} from './path-context';
import {BottomSide, TopSide} from './TopSide';
import {useTransformations} from './transformation-context';
import {isBacksideVisible} from './viewing-frontside';

export const ExtrudeDiv: React.FC<{
	readonly children: React.ReactNode;
	readonly width: number;
	readonly height: number;
	readonly depth: number;
	readonly cornerRadius: number;
	readonly backFace?: React.ReactNode;
	readonly topFace?: React.ReactNode;
	readonly bottomFace?: React.ReactNode;
	readonly style?: React.CSSProperties;
}> = ({
	children,
	width,
	height,
	depth,
	cornerRadius,
	backFace,
	style,
	topFace,
	bottomFace,
}) => {
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
				{topFace ? (
					<TopSide depth={depth} width={width} height={height}>
						{topFace}
					</TopSide>
				) : null}
				{bottomFace ? (
					<BottomSide depth={depth} width={width} height={height}>
						{bottomFace}
					</BottomSide>
				) : null}
			</div>
		</RectProvider>
	);
};

export const ThreeDiv: React.FC<React.HtmlHTMLAttributes<HTMLDivElement>> = ({
	style,
	...props
}) => {
	return (
		<div
			{...props}
			style={{...style, transform: makeMatrix3dTransform(useTransformations())}}
		/>
	);
};
