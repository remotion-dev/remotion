import {dropShadow} from '@remotion/effects/drop-shadow';
import {gridlines} from '@remotion/effects/gridlines';
import {paper} from '@remotion/effects/paper';
import {roughenEdges} from '@remotion/effects/roughen-edges';

/** Plain white paper the cut-outs are made of. */
export const CUTOUT_PAPER_COLOR = '#ffffff';

/**
 * The shared paper cut-out look (disco ball, clip boxes): white paper with a
 * light paper() texture, faint grid paper lines, a torn edge and a soft shadow.
 *
 * `unit` is how many canvas pixels make up one on-screen pixel at the size it
 * is shown, so every cut-out has the same grid, edge and shadow on screen.
 */
export const cutoutPaperEffects = ({
	unit,
	seed,
	edgeRoughness,
	gridOpacity,
	shadow = true,
	shadowOpacity = 0.6,
}: {
	unit: number;
	seed: number;
	edgeRoughness: number | null;
	gridOpacity: number | null;
	shadow?: boolean;
	shadowOpacity?: number;
}) => [
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
		seed,
	}),
	gridlines({
		gridSize: Math.round(45 * unit),
		lineWidth: Math.max(1, 1.44 * unit),
		lineColor: `rgba(42, 59, 85, ${gridOpacity ?? 0.14})`,
		maskToSourceAlpha: true,
	}),
	roughenEdges({
		amount: edgeRoughness ?? 1,
		border: Math.max(3, 7.2 * unit),
		scale: 0.06 / unit,
		seed: seed * 7 + 12,
	}),
	dropShadow({
		disabled: !shadow,
		radius: 18 * unit,
		offsetX: 12.6 * unit,
		offsetY: 19.8 * unit,
		opacity: shadowOpacity,
		color: '#000000',
	}),
];
