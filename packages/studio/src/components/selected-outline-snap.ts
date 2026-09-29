import {CanvasInternals} from '@remotion/canvas';
import {SELECTED_OUTLINE_SNAP_COLOR} from '../helpers/colors';

export type {
	CanvasOutlineSnapAxis as SelectedOutlineSnapAxis,
	CanvasOutlineSnapEdge as SelectedOutlineSnapEdge,
	CanvasOutlineSnapPoint as SelectedOutlineSnapPoint,
	CanvasOutlineSnapResult as SelectedOutlineSnapResult,
	CanvasOutlineSnapTarget as SelectedOutlineSnapTarget,
	CanvasOutlineSnapTargetType as SelectedOutlineSnapTargetType,
} from '@remotion/canvas';

export const {
	canvasOutlineSnapThresholdPx: selectedOutlineSnapThresholdPx,
	findCanvasOutlineSnap: findSelectedOutlineSnap,
	getCanvasOutlineSnapTargets: getSelectedOutlineSnapTargets,
} = CanvasInternals;

export const selectedOutlineSnapIndicatorColor = SELECTED_OUTLINE_SNAP_COLOR;
