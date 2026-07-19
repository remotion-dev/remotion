import type {KeyframeSettings as KeyframeSettingsValue} from '@remotion/studio-shared';
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
import {InspectorDetailRow, InspectorSectionHeader} from './common';
import {detailsContainer} from './styles';

const comboStyle: React.CSSProperties = {
	minWidth: 120,
};

const keyframeSettingsContainer: React.CSSProperties = {
	...detailsContainer,
	paddingBottom: 0,
};

const extrapolateOptions = [
	'extend',
	'clamp',
	'identity',
	'wrap',
] as const satisfies ExtrapolateType[];

const labelForExtrapolate = (value: ExtrapolateType) =>
	value[0].toUpperCase() + value.slice(1);

const getExtrapolateValues = (
	onSelect: (value: ExtrapolateType) => void,
	disabled: boolean,
): ComboboxValue[] => {
	return extrapolateOptions.map((value) => ({
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
	const [posterize, setPosterize] = useState(propStatus.posterize ?? 0);
	const canEditInterpolationSettings =
		propStatus.interpolationFunction === 'interpolate';
	const disabled = previewServerState.type !== 'connected';

	useEffect(() => {
		setPosterize(propStatus.posterize ?? 0);
	}, [propStatus.posterize]);

	const save = useCallback(
		(settings: KeyframeSettingsValue) => {
			if (previewServerState.type !== 'connected') {
				return;
			}

			if (update.type === 'sequence') {
				callUpdateSequenceKeyframeSettings({
					fileName: update.fileName,
					nodePath: update.nodePath,
					fieldKey: update.fieldKey,
					settings,
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
				settings,
				schema: update.schema,
				setPropStatuses,
				clientId: previewServerState.clientId,
			}).catch(() => undefined);
		},
		[previewServerState, setPropStatuses, update],
	);

	const saveSettings = useCallback(
		({
			left = propStatus.clamping.left,
			output = propStatus.output ?? 'linear',
			posterize: nextPosterize = propStatus.posterize ?? 0,
			right = propStatus.clamping.right,
		}: {
			readonly left?: ExtrapolateType;
			readonly output?: InterpolateOutputOption;
			readonly posterize?: number;
			readonly right?: ExtrapolateType;
		}) => {
			save({
				type: 'settings',
				clamping: canEditInterpolationSettings ? {left, right} : undefined,
				output: canEditInterpolationSettings ? output : undefined,
				posterize: nextPosterize <= 0 ? undefined : nextPosterize,
			});
		},
		[
			canEditInterpolationSettings,
			propStatus.clamping.left,
			propStatus.clamping.right,
			propStatus.output,
			propStatus.posterize,
			save,
		],
	);

	const onSelectLeft = useCallback(
		(left: ExtrapolateType) => saveSettings({left}),
		[saveSettings],
	);
	const onSelectRight = useCallback(
		(right: ExtrapolateType) => saveSettings({right}),
		[saveSettings],
	);
	const onSelectOutput = useCallback(
		(output: InterpolateOutputOption) => saveSettings({output}),
		[saveSettings],
	);
	const leftValues = useMemo(
		() => getExtrapolateValues(onSelectLeft, disabled),
		[disabled, onSelectLeft],
	);
	const rightValues = useMemo(
		() => getExtrapolateValues(onSelectRight, disabled),
		[disabled, onSelectRight],
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
		<>
			<InspectorSectionHeader>Keyframe settings</InspectorSectionHeader>
			<div style={keyframeSettingsContainer}>
				{canEditInterpolationSettings ? (
					<>
						<InspectorDetailRow label="Extrapolate left">
							<Combobox
								values={leftValues}
								selectedId={propStatus.clamping.left}
								title="Extrapolate left"
								style={comboStyle}
								small
							/>
						</InspectorDetailRow>
						<InspectorDetailRow label="Extrapolate right">
							<Combobox
								values={rightValues}
								selectedId={propStatus.clamping.right}
								title="Extrapolate right"
								style={comboStyle}
								small
							/>
						</InspectorDetailRow>
						<InspectorDetailRow label="Output">
							<Combobox
								values={outputValues}
								selectedId={propStatus.output ?? 'linear'}
								title="Output"
								style={comboStyle}
								small
							/>
						</InspectorDetailRow>
					</>
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
		</>
	);
};
