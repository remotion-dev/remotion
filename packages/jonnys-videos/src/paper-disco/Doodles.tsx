import {dropShadow} from '@remotion/effects/drop-shadow';
import {paper} from '@remotion/effects/paper';
import {roughenEdges} from '@remotion/effects/roughen-edges';
import React, {useMemo} from 'react';
import {CanvasImage, random, useCurrentFrame} from 'remotion';
import {makeSolidPaperTexture, starPath} from './textures';

/**
 * A hand-drawn 4-point sparkle. Its points jitter every `posterize` frames
 * so the line "boils" like stop-motion pencil animation.
 */
export const PencilSparkle: React.FC<{
	readonly size: number;
	readonly color?: string;
	readonly seed: string;
	readonly posterize?: number;
	readonly draw?: number;
	readonly style?: React.CSSProperties;
}> = ({size, color = '#2d2926', seed, posterize = 3, draw = 1, style}) => {
	const frame = useCurrentFrame();
	const step = Math.floor(frame / posterize) % 3;
	const j = (k: string) => (random(`${seed}-${k}-${step}`) - 0.5) * size * 0.06;
	const c = size / 2;
	const o = size * 0.46;
	const i = size * 0.09;
	const d = [
		`M${c + j('a')} ${c - o + j('b')}`,
		`Q${c + i + j('c')} ${c - i + j('d')} ${c + o + j('e')} ${c + j('f')}`,
		`Q${c + i + j('g')} ${c + i + j('h')} ${c + j('i')} ${c + o + j('j')}`,
		`Q${c - i + j('k')} ${c + i + j('l')} ${c - o + j('m')} ${c + j('n')}`,
		`Q${c - i + j('o')} ${c - i + j('p')} ${c + j('a')} ${c - o + j('b')}`,
	].join(' ');

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			style={style}
		>
			<path
				d={d}
				fill="none"
				stroke={color}
				strokeWidth={Math.max(3, size * 0.035)}
				strokeLinecap="round"
				strokeLinejoin="round"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - draw}
			/>
		</svg>
	);
};

/** A construction-paper star, cut out with scissors, casting a shadow. */
export const PaperStar: React.FC<{
	readonly name: string;
	readonly size: number;
	readonly color: string;
	readonly seed: number;
	readonly style?: React.CSSProperties;
}> = ({name, size, color, seed, style}) => {
	const pad = size * 0.18;
	const canvas = Math.round(size + pad * 2);
	const texture = useMemo(
		() =>
			makeSolidPaperTexture({
				width: canvas,
				height: canvas,
				color,
				path: starPath(canvas / 2, canvas / 2, size / 2, size / 4.4),
			}),
		[canvas, color, size],
	);

	return (
		<CanvasImage
			name={name}
			src={texture}
			width={canvas}
			height={canvas}
			fit="fill"
			style={style}
			effects={[
				paper({
					amount: 0.45,
					colorFront: '#ececf0',
					colorBack: '#ffffff',
					contrast: 0.12,
					roughness: 0.15,
					fiber: 0.12,
					fiberSize: 0.15,
					crumples: 0.12,
					crumpleSize: 0.4,
					folds: 0.15,
					foldCount: 2,
					drops: 0,
					seed: seed,
				}),
				roughenEdges({
					amount: 1,
					border: 5,
					scale: 0.12,
					seed: seed,
				}),
				dropShadow({
					radius: 7,
					offsetX: 5,
					offsetY: 7,
					opacity: 0.22,
					color: '#000000',
				}),
			]}
		/>
	);
};
