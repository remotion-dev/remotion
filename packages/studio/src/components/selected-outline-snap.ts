import {CanvasInternals} from '@remotion/sdk';
import {SELECTED_OUTLINE_SNAP_COLOR} from '../helpers/colors';

export type {
	CanvasOutlineSnapAxis as SelectedOutlineSnapAxis,
	CanvasOutlineSnapEdge as SelectedOutlineSnapEdge,
	CanvasOutlineSnapPoint as SelectedOutlineSnapPoint,
	CanvasOutlineSnapResult as SelectedOutlineSnapResult,
	CanvasOutlineSnapTarget as SelectedOutlineSnapTarget,
	CanvasOutlineSnapTargetType as SelectedOutlineSnapTargetType,
} from '@remotion/sdk';

export const {
	canvasOutlineSnapThresholdPx: selectedOutlineSnapThresholdPx,
	findCanvasOutlineSnap: findSelectedOutlineSnap,
	getCanvasOutlineSnapTargets: getSelectedOutlineSnapTargets,
}: typeof CanvasInternals = CanvasInternals;

export const selectedOutlineSnapIndicatorColor = SELECTED_OUTLINE_SNAP_COLOR;
