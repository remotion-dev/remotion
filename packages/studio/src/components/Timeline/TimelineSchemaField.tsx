import React from 'react';
import type {
	CanUpdateSequencePropStatusFalse,
	CanUpdateSequencePropStatusStatic,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {LIGHT_TEXT, WHITE_ALPHA_40} from '../../helpers/colors';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {TimelineArrayField} from './TimelineArrayField';
import {
	isTimelinePrimitiveFieldInfo,
	TimelinePrimitiveFieldValue,
} from './TimelinePrimitiveFieldValue';

const INTERACTIVITY_BEST_PRACTICES_DOCS =
	'https://www.remotion.dev/docs/studio/interactivity-best-practices';

export const TIMELINE_COMPUTED_EFFECT_FIX_LINK = `${INTERACTIVITY_BEST_PRACTICES_DOCS}#keep-effects-editable`;

const unsupportedStatusWrapper: React.CSSProperties = {
	alignItems: 'center',
	display: 'inline-flex',
	gap: 4,
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const unsupportedLabel: React.CSSProperties = {
	color: WHITE_ALPHA_40,
	fontSize: 12,
	fontStyle: 'italic',
};

const computedValue: React.CSSProperties = {
	color: WHITE_ALPHA_40,
	pointerEvents: 'none',
};

const fixLinkBase: React.CSSProperties = {
	color: LIGHT_TEXT,
	display: 'inline-block',
	fontSize: 10,
	fontStyle: 'normal',
	fontWeight: 600,
	lineHeight: 1,
	textDecoration: 'none',
	width: 17,
};

export const UnsupportedStatus: React.FC<{
	readonly label: React.ReactNode;
	readonly fixHref?: string;
	readonly formattedValue: boolean;
}> = ({label, fixHref, formattedValue}) => {
	const [hovered, setHovered] = React.useState(false);
	const [focused, setFocused] = React.useState(false);
	const visible = hovered || focused;

	const fixLink: React.CSSProperties = React.useMemo(() => {
		return {
			...fixLinkBase,
			opacity: visible ? 1 : 0,
			pointerEvents: visible ? 'auto' : 'none',
		};
	}, [visible]);

	const stopMousePropagation: React.MouseEventHandler<HTMLAnchorElement> = (
		event,
	) => {
		event.stopPropagation();
	};

	const stopPointerPropagation: React.PointerEventHandler<HTMLAnchorElement> = (
		event,
	) => {
		event.stopPropagation();
	};

	return (
		<span
			style={unsupportedStatusWrapper}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
		>
			<span
				style={formattedValue ? computedValue : unsupportedLabel}
				inert={formattedValue}
			>
				{label}
			</span>
			{fixHref ? (
				<a
					href={fixHref}
					target="_blank"
					rel="noreferrer"
					style={fixLink}
					title="Open docs to fix computed Studio values"
					onClick={stopMousePropagation}
					onDoubleClick={stopMousePropagation}
					onPointerDown={stopPointerPropagation}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					tabIndex={visible ? 0 : -1}
				>
					Fix
				</a>
			) : null}
		</span>
	);
};

export const TimelineNonEditableStatus: React.FC<{
	readonly propStatus: CanUpdateSequencePropStatusFalse;
	readonly field: SchemaFieldInfo;
	readonly runtimeValue: unknown;
	readonly scaleLockNodePath: SequencePropsSubscriptionKey | null;
	readonly fixHref: string;
}> = ({propStatus, field, runtimeValue, scaleLockNodePath, fixHref}) => {
	if (propStatus.status === 'computed') {
		return (
			<UnsupportedStatus
				label={
					<TimelineFieldValue
						field={field}
						onSave={() => Promise.resolve()}
						onDragValueChange={() => undefined}
						onDragEnd={() => undefined}
						propStatus={{
							status: 'static',
							codeValue: runtimeValue,
							keyframeDisplayOffsetAdjustment: null,
						}}
						effectiveValue={runtimeValue}
						scaleLockNodePath={scaleLockNodePath}
						valueStyle={computedValue}
					/>
				}
				fixHref={fixHref}
				formattedValue
			/>
		);
	}
};

export const TimelineFieldValue: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly scaleLockNodePath: SequencePropsSubscriptionKey | null;
	readonly valueStyle?: React.CSSProperties;
}> = ({
	field,
	onSave,
	onDragValueChange,
	onDragEnd,
	propStatus,
	effectiveValue,
	scaleLockNodePath,
	valueStyle,
}) => {
	if (isTimelinePrimitiveFieldInfo(field)) {
		return (
			<TimelinePrimitiveFieldValue
				effectiveValue={effectiveValue}
				field={field}
				onDragEnd={onDragEnd}
				onDragValueChange={onDragValueChange}
				onSave={onSave}
				propStatus={propStatus}
				scaleLockNodePath={scaleLockNodePath}
				valueStyle={valueStyle}
			/>
		);
	}

	if (field.typeName === 'array') {
		return (
			<span>
				<TimelineArrayField
					effectiveValue={effectiveValue}
					field={field}
					onDragEnd={onDragEnd}
					onDragValueChange={onDragValueChange}
					onSave={onSave}
				/>
			</span>
		);
	}

	throw new Error(`Unsupported field type: ${field.typeName}`);
};
