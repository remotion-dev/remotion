import type {
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	InteractivitySchema,
	InteractivitySchemaField,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import type {ComboboxValue} from './NewComposition/ComboBox';
import type {SelectedOutlineUvHandle} from './selected-outline-uv';
import type {TimelineSelection} from './Timeline/TimelineSelection';

export type SelectedOutlineContextMenuOpenResult =
	| false
	| void
	| readonly ComboboxValue[];

export type SelectedOutlineContextMenuOpenHandler = () =>
	| SelectedOutlineContextMenuOpenResult
	| Promise<SelectedOutlineContextMenuOpenResult>;

export type SelectedOutlineTarget = {
	readonly key: string;
	readonly containsSelection: boolean;
	readonly effectDrop: SelectedOutlineEffectDropTarget | null;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly ref: React.RefObject<Element | null>;
	readonly selected: boolean;
	readonly selection: TimelineSelection;
	readonly sequence: TSequence;
	readonly drag: SelectedOutlineDragTarget | null;
	readonly scaleDrag: SelectedOutlineScaleDragTarget | null;
	readonly rotationDrag: SelectedOutlineRotationDragTarget | null;
	readonly transformOriginDrag: SelectedOutlineTransformOriginDragTarget | null;
	readonly uvHandles: readonly SelectedOutlineUvHandle[];
};

export type SelectedOutlineEffectDropTarget = {
	readonly clientId: string;
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
};

export type SelectedOutlineDragTarget = {
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly clientId: string;
	readonly fieldDefault: string | undefined;
	readonly keyframeDisplayOffset: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
};

export type SelectedOutlineTransformOriginDragTarget = {
	readonly clientId: string;
	readonly keyframeDisplayOffset: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly originDefault: string | undefined;
	readonly originPropStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly originValue: string;
	readonly rotateValue: string;
	readonly scaleValue: number | string;
	readonly schema: InteractivitySchema;
	readonly sourceFrame: number;
	readonly translateDefault: string | undefined;
	readonly translatePropStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly translateValue: string;
};

export type ScaleFieldSchema = Extract<
	InteractivitySchemaField,
	{type: 'scale'}
>;
export type RotationFieldSchema = Extract<
	InteractivitySchemaField,
	{type: 'rotation-css'}
>;

export type SelectedOutlineScaleDragTarget = {
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly clientId: string;
	readonly fieldDefault: number | string | undefined;
	readonly fieldSchema: ScaleFieldSchema;
	readonly keyframeDisplayOffset: number;
	readonly linked: boolean;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
};

export type SelectedOutlineRotationDragTarget = {
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly clientId: string;
	readonly fieldDefault: string | undefined;
	readonly fieldSchema: RotationFieldSchema;
	readonly keyframeDisplayOffset: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly transformOriginValue: string;
};

export type SelectedOutlineDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly sourceFrame: number;
	readonly startX: number;
	readonly startY: number;
	readonly target: SelectedOutlineDragTarget;
};

export type SelectedOutlineScaleDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly sourceFrame: number;
	readonly startX: number;
	readonly startY: number;
	readonly startZ: number;
	readonly target: SelectedOutlineScaleDragTarget;
};

export type SelectedOutlineRotationDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly sourceFrame: number;
	readonly startDegrees: number;
	readonly target: SelectedOutlineRotationDragTarget;
};

export type SequenceWithSelectedOutline = {
	readonly depth: number;
	readonly keyframeDisplayOffset: number;
	readonly key: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: TSequence;
};

export const translateFieldKey = 'style.translate';
export const scaleFieldKey = 'style.scale';
export const rotateFieldKey = 'style.rotate';
export const transformOriginFieldKey = 'style.transformOrigin';
export const selectedOutlineDragThresholdPx = 4;

export const outlineContainer: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	overflow: 'visible',
};

export const emptyContextMenuValues: readonly ComboboxValue[] = [];

export type SelectedOutlineKeyboardNudgeSession = {
	readonly dragStates: readonly SelectedOutlineDragState[];
	readonly clientId: string;
	deltaX: number;
	deltaY: number;
	lastValues: ReadonlyMap<string, string>;
};
