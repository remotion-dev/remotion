import {
	getCanvasKeyframeSettings,
	getCanvasKeyframeSettingsChange,
	type CanvasKeyframeSettings,
} from '@remotion/canvas';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {ExtrapolateType, InterpolateOutputOption} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {Combobox, type ComboboxValue} from '../NewComposition/ComboBox';
import {InputDragger} from '../NewComposition/InputDragger';
import {
	callUpdateEffectKeyframeSettings,
	callUpdateSequenceKeyframeSettings,
} from '../Timeline/call-update-keyframe-settings';
import type {SelectedEasingUpdate} from '../Timeline/update-selected-easing';
import {CollapsibleInspectorSection} from './CollapsibleInspectorSection';
import {InspectorDetailRow} from './common';
import {detailsContainer} from './styles';

const comboStyle: React.CSSProperties = {
	minWidth: 120,
};

const keyframeSettingsContainer: React.CSSProperties = {
	...detailsContainer,
	paddingBottom: 0,
};

const labelForExtrapolate = (value: ExtrapolateType) =>
	value[0].toUpperCase() + value.slice(1);

const getExtrapolateValues = (
	extrapolateTypes: readonly ExtrapolateType[],
	onSelect: (value: ExtrapolateType) => void,
	disabled: boolean,
): ComboboxValue[] => {
	return extrapolateTypes.map((value) => ({
		type: 'item',
		id: value,
		keyHint: null,
		label: labelForExtrapolate(value),
		leftItem: null,
		disabled,
		onClick: () => onSelect(value),
		quickSwitcherLabel: null,
		subMenu: null,
		value,
	}));
};

const outputOptions = [
	'linear',
	'perceptual-scale',
] as const satisfies InterpolateOutputOption[];

const labelForOutput = (value: InterpolateOutputOption) => {
	return value === 'perceptual-scale' ? 'Perceptual scale' : 'Linear';
};

const getOutputValues = (
	onSelect: (value: InterpolateOutputOption) => void,
	disabled: boolean,
): ComboboxValue[] => {
	return outputOptions.map((value) => ({
		type: 'item',
		id: value,
		keyHint: null,
		label: labelForOutput(value),
		leftItem: null,
		disabled,
		onClick: () => onSelect(value),
		quickSwitcherLabel: null,
		subMenu: null,
		value,
	}));
};

export const KeyframeSettings: React.FC<{
	readonly update: SelectedEasingUpdate;
}> = ({update}) => {
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {propStatus} = update;
	const settings = useMemo(
		() => getCanvasKeyframeSettings(propStatus),
		[propStatus],
	);
	const [posterize, setPosterize] = useState(settings.posterize ?? 0);
	const disabled = previewServerState.type !== 'connected';

	useEffect(() => {
		setPosterize(settings.posterize ?? 0);
	}, [settings.posterize]);

	const saveSettings = useCallback(
		(next: Partial<CanvasKeyframeSettings>) => {
			if (previewServerState.type !== 'connected') {
				return;
			}

			const {operation} = getCanvasKeyframeSettingsChange({
				nodePathInfo: update.nodePathInfo,
				schema: update.schema,
				key: update.fieldKey,
				propStatus,
				settings: {...settings, ...next},
			});

			if (update.type === 'sequence') {
				callUpdateSequenceKeyframeSettings({
					fileName: update.fileName,
					nodePath: update.nodePath,
					fieldKey: update.fieldKey,
					settings: operation,
					schema: update.schema,
					setPropStatuses,
					clientId: previewServerState.clientId,
				}).catch(() => undefined);
				return;
			}

			callUpdateEffectKeyframeSettings({
				fileName: update.fileName,
				nodePath: update.nodePath,
				effectIndex: update.effectIndex,
				fieldKey: update.fieldKey,
				settings: operation,
				schema: update.schema,
				setPropStatuses,
				clientId: previewServerState.clientId,
			}).catch(() => undefined);
		},
		[previewServerState, propStatus, setPropStatuses, settings, update],
	);

	const onSelectLeft = useCallback(
		(left: ExtrapolateType) => {
			if (settings.clamping) {
				saveSettings({clamping: {...settings.clamping, left}});
			}
		},
		[saveSettings, settings.clamping],
	);
	const onSelectRight = useCallback(
		(right: ExtrapolateType) => {
			if (settings.clamping) {
				saveSettings({clamping: {...settings.clamping, right}});
			}
		},
		[saveSettings, settings.clamping],
	);
	const onSelectOutput = useCallback(
		(output: InterpolateOutputOption) => saveSettings({output}),
		[saveSettings],
	);
	const leftValues = useMemo(
		() =>
			getExtrapolateValues(settings.extrapolateTypes, onSelectLeft, disabled),
		[disabled, onSelectLeft, settings.extrapolateTypes],
	);
	const rightValues = useMemo(
		() =>
			getExtrapolateValues(settings.extrapolateTypes, onSelectRight, disabled),
		[disabled, onSelectRight, settings.extrapolateTypes],
	);
	const outputValues = useMemo(
		() => getOutputValues(onSelectOutput, disabled),
		[disabled, onSelectOutput],
	);

	const onPosterizeChange = useCallback((value: number) => {
		setPosterize(Math.max(0, Math.round(value)));
	}, []);
	const onPosterizeChangeEnd = useCallback(
		(value: number) => {
			const nextPosterize = Math.max(0, Math.round(value));
			setPosterize(nextPosterize);
			saveSettings({posterize: nextPosterize});
		},
		[saveSettings],
	);
	const posterizeFormatter = useCallback((value: number | string) => {
		return String(Math.round(Number(value)));
	}, []);

	return (
		<CollapsibleInspectorSection
			collapsible
			label="Keyframe settings"
			sectionId="keyframe-settings"
		>
			<div style={keyframeSettingsContainer}>
				{settings.clamping ? (
					<>
						<InspectorDetailRow label="Extrapolate left">
							<Combobox
								values={leftValues}
								selectedId={settings.clamping.left}
								aria-label="Extrapolate left"
								style={comboStyle}
								size="small"
							/>
						</InspectorDetailRow>
						<InspectorDetailRow label="Extrapolate right">
							<Combobox
								values={rightValues}
								selectedId={settings.clamping.right}
								aria-label="Extrapolate right"
								style={comboStyle}
								size="small"
							/>
						</InspectorDetailRow>
					</>
				) : null}
				{settings.output ? (
					<InspectorDetailRow label="Output">
						<Combobox
							values={outputValues}
							selectedId={settings.output}
							aria-label="Output"
							style={comboStyle}
							size="small"
						/>
					</InspectorDetailRow>
				) : null}
				<InspectorDetailRow label="Posterize">
					<InputDragger
						type="number"
						value={posterize}
						status="ok"
						onValueChange={onPosterizeChange}
						onValueChangeEnd={onPosterizeChangeEnd}
						onTextChange={() => undefined}
						min={0}
						step={1}
						formatter={posterizeFormatter}
						rightAlign
						small
						disabled={disabled}
					/>
				</InspectorDetailRow>
			</div>
		</CollapsibleInspectorSection>
	);
};
