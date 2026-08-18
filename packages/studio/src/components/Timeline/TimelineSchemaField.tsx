import React, {useCallback, useContext} from 'react';
import type {
	CanUpdateSequencePropStatusFalse,
	CanUpdateSequencePropStatusStatic,
	SequencePropsSubscriptionKey,
} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {LIGHT_TEXT, WHITE_ALPHA_40} from '../../helpers/colors';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {SetSelectedModalContext} from '../../state/modals';
import {updateAvailable} from '../RenderQueue/actions';
import {formatTimelineFieldValueForDisplay} from './timeline-field-display-utils';
import {TimelineArrayField} from './TimelineArrayField';
import {
	isTimelinePrimitiveFieldInfo,
	TimelinePrimitiveFieldValue,
} from './TimelinePrimitiveFieldValue';

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
	appearance: 'none',
	background: 'none',
	border: 'none',
	cursor: 'pointer',
	padding: 0,
};

export const UnsupportedStatus: React.FC<{
	readonly label: React.ReactNode;
	readonly onFix?: () => void;
	readonly formattedValue: boolean;
}> = ({label, onFix, formattedValue}) => {
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

	const stopMousePropagation: React.MouseEventHandler<HTMLButtonElement> = (
		event,
	) => {
		event.stopPropagation();
	};

	const stopPointerPropagation: React.PointerEventHandler<HTMLButtonElement> = (
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
			{onFix ? (
				<button
					type="button"
					style={fixLink}
					title="Fix computed Studio value"
					onClick={(event) => {
						stopMousePropagation(event);
						onFix();
					}}
					onDoubleClick={stopMousePropagation}
					onPointerDown={stopPointerPropagation}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					tabIndex={visible ? 0 : -1}
				>
					Fix
				</button>
			) : null}
		</span>
	);
};

export const TimelineNonEditableStatus: React.FC<{
	readonly propStatus: CanUpdateSequencePropStatusFalse;
	readonly field: SchemaFieldInfo;
	readonly runtimeValue: unknown;
	readonly validatedLocation: CodePosition;
}> = ({propStatus, field, runtimeValue, validatedLocation}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const onFix = useCallback(() => {
		const controller = new AbortController();
		updateAvailable(controller.signal)
			.then((info) => {
				setSelectedModal({
					type: 'fix-computed-value',
					prop: field.key,
					context: `${validatedLocation.source}:${validatedLocation.line}:${validatedLocation.column}`,
					remotionInteractivitySkillAvailable:
						info.remotionInteractivitySkillAvailable,
				});
			})
			.catch(() => {
				setSelectedModal({
					type: 'fix-computed-value',
					prop: field.key,
					context: `${validatedLocation.source}:${validatedLocation.line}:${validatedLocation.column}`,
					remotionInteractivitySkillAvailable: false,
				});
			});
	}, [field.key, setSelectedModal, validatedLocation]);

	if (propStatus.status === 'computed') {
		return (
			<UnsupportedStatus
				label={formatTimelineFieldValueForDisplay({
					fieldSchema: field.fieldSchema,
					value: runtimeValue,
				})}
				onFix={onFix}
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
}> = ({
	field,
	onSave,
	onDragValueChange,
	onDragEnd,
	propStatus,
	effectiveValue,
	scaleLockNodePath,
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
