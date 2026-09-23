import type {
	CanvasOutlineCrop,
	CanvasOutlineLayoutTarget,
	CanvasSelectableOutline,
} from '@remotion/canvas/internal';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	InteractivitySchema,
	InteractivitySchemaField,
	SequencePropsSubscriptionKey,
} from 'remotion';
import type {ComboboxValue} from './NewComposition/ComboBox';
import type {KeyframeSourceFrame} from './Timeline/get-timeline-keyframes';

export type SelectedOutlineContextMenuOpenResult =
	| false
	| readonly ComboboxValue[];

export type SelectedOutlineContextMenuOpenHandler = () =>
	| SelectedOutlineContextMenuOpenResult
	| Promise<SelectedOutlineContextMenuOpenResult>;

export type SelectedOutlineLayoutTarget = CanvasOutlineLayoutTarget & {
	readonly selectedForCrop: boolean;
	readonly selectedForRotation: boolean;
	readonly selectedForTransformOrigin: boolean;
	readonly selectedForUvHandles: boolean;
	readonly transformOriginValue: string;
	readonly crop: CanvasOutlineCrop;
};

export type SelectedOutlineTarget = SelectedOutlineLayoutTarget & {
	readonly canCrop: boolean;
	readonly cropDrag: SelectedOutlineCropDragTarget | null;
	readonly drag: SelectedOutlineDragTarget | null;
	readonly scaleDrag: SelectedOutlineScaleDragTarget | null;
	readonly rotationDrag: SelectedOutlineRotationDragTarget | null;
	readonly transformOriginDrag: SelectedOutlineTransformOriginDragTarget | null;
};

export const cropFieldKeys = {
	left: 'cropLeft',
	right: 'cropRight',
	top: 'cropTop',
	bottom: 'cropBottom',
} as const;

export type SelectedOutlineCropEdge = keyof typeof cropFieldKeys;
export type SelectedOutlineCropFieldKey =
	(typeof cropFieldKeys)[SelectedOutlineCropEdge];

export const canEditSelectedOutlineCrop = ({
	schema,
	propStatuses,
}: {
	readonly schema: InteractivitySchema | null;
	readonly propStatuses:
		| Record<string, CanUpdateSequencePropStatus>
		| undefined;
}): boolean => {
	for (const fieldKey of Object.values(cropFieldKeys)) {
		const fieldSchema = schema?.[fieldKey];
		const propStatus = propStatuses?.[fieldKey];
		const canEditStatus =
			propStatus?.status === 'static' ||
			(propStatus?.status === 'keyframed' &&
				propStatus.interpolationFunction === 'interpolate');

		if (fieldSchema?.type !== 'number' || !canEditStatus) {
			return false;
		}
	}

	return true;
};

export type SelectedOutlineCropHandle =
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'top'
	| 'right'
	| 'bottom'
	| 'left';

type CropNumberFieldSchema = Extract<
	InteractivitySchemaField,
	{type: 'number'}
>;

export type SelectedOutlineCropField = {
	readonly defaultValue: number | null | undefined;
	readonly fieldSchema: CropNumberFieldSchema;
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly value: number;
};

export type SelectedOutlineCropDragTarget = {
	readonly clientId: string;
	readonly fields: Record<
		SelectedOutlineCropFieldKey,
		SelectedOutlineCropField
	>;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly sourceFrame: KeyframeSourceFrame;
	readonly transformOrigin: {
		readonly defaultValue: string | undefined;
		readonly propStatus: CanUpdateSequencePropStatus;
		readonly value: string;
	} | null;
};

export type SelectedOutlineDragTarget = {
	readonly propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly clientId: string;
	readonly fieldDefault: string | undefined;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
};

export type SelectedOutlineTransformOriginDragTarget = {
	readonly clientId: string;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly originDefault: string | undefined;
	readonly originPropStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	readonly originValue: string;
	readonly rotateValue: string;
	readonly scaleValue: number | string;
	readonly schema: InteractivitySchema;
	readonly sourceFrame: KeyframeSourceFrame;
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
	readonly keyframePlaybackRate: number;
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
	readonly keyframePlaybackRate: number;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly transform3DMode: boolean;
	readonly transformOriginValue: string;
};

export type SelectedOutlineDragState = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly sourceFrame: number;
	readonly startX: number;
	readonly startY: number;
	readonly startZ: number | null;
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
	readonly startRotation: readonly [number, number, number];
	readonly startValue: string;
	readonly target: SelectedOutlineRotationDragTarget;
};

export type SequenceWithSelectedOutline = CanvasSelectableOutline;

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
