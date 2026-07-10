import type {KeyframeSettings} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	ExtrapolateType,
	InterpolateOutputOption,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {INPUT_BACKGROUND, WHITE_ALPHA_60} from '../../helpers/colors';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {Row, Spacing} from '../layout';
import {ModalButton} from '../ModalButton';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {Combobox, type ComboboxValue} from '../NewComposition/ComboBox';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {InputDragger} from '../NewComposition/InputDragger';
import {
	callUpdateEffectKeyframeSettings,
	callUpdateSequenceKeyframeSettings,
} from './call-update-keyframe-settings';

const container: React.CSSProperties = {
	padding: 16,
	width: 520,
};

const row: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	justifyContent: 'space-between',
	marginBottom: 12,
};

const label: React.CSSProperties = {
	fontSize: 13,
};

const helperText: React.CSSProperties = {
	color: WHITE_ALPHA_60,
	fontSize: 12,
	lineHeight: 1.4,
	marginTop: 4,
};

const comboStyle: React.CSSProperties = {
	minWidth: 150,
};

const posterizeInputStyle: React.CSSProperties = {
	backgroundColor: INPUT_BACKGROUND,
	borderRadius: 4,
	minWidth: 64,
	textAlign: 'right',
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
): ComboboxValue[] => {
	return extrapolateOptions.map((value) => ({
		type: 'item',
		id: value,
		keyHint: null,
		label: labelForExtrapolate(value),
		leftItem: null,
		disabled: false,
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
	if (value === 'perceptual-scale') {
		return 'Perceptual scale';
	}

	return 'Linear';
};

const getOutputValues = (
	onSelect: (value: InterpolateOutputOption) => void,
): ComboboxValue[] => {
	return outputOptions.map((value) => ({
		type: 'item',
		id: value,
		keyHint: null,
		label: labelForOutput(value),
		leftItem: null,
		disabled: false,
		onClick: () => onSelect(value),
		quickSwitcherLabel: null,
		subMenu: null,
		value,
	}));
};

export type KeyframeSettingsModalState = {
	type: 'keyframe-settings';
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	fieldLabel: string;
	status: CanUpdateSequencePropStatusKeyframed;
	schema: InteractivitySchema;
	effectIndex: number | null;
};

export const KeyframeSettingsModal: React.FC<{
	readonly state: KeyframeSettingsModalState;
}> = ({state}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [left, setLeft] = useState(state.status.clamping.left);
	const [right, setRight] = useState(state.status.clamping.right);
	const [output, setOutput] = useState<InterpolateOutputOption>(
		state.status.output ?? 'linear',
	);
	const [posterize, setPosterize] = useState(state.status.posterize ?? 0);
	const [saving, setSaving] = useState(false);
	const canEditClamping = state.status.interpolationFunction === 'interpolate';
	const canEditOutput = state.status.interpolationFunction === 'interpolate';

	const close = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const leftOptions = useMemo(() => getExtrapolateValues(setLeft), []);
	const rightOptions = useMemo(() => getExtrapolateValues(setRight), []);
	const outputValues = useMemo(() => getOutputValues(setOutput), []);

	const onPosterizeChange = useCallback((value: number) => {
		setPosterize(Math.max(0, Math.round(value)));
	}, []);

	const posterizeFormatter = useCallback((value: number | string) => {
		const numericValue = Number(value);
		return String(Math.round(numericValue));
	}, []);

	const onSave = useCallback(() => {
		if (previewServerState.type !== 'connected') {
			return;
		}

		const settings: KeyframeSettings = {
			type: 'settings',
			clamping: canEditClamping ? {left, right} : undefined,
			output: canEditOutput ? output : undefined,
			posterize: posterize <= 0 ? undefined : posterize,
		};

		setSaving(true);
		const promise =
			state.effectIndex === null
				? callUpdateSequenceKeyframeSettings({
						fileName: state.fileName,
						nodePath: state.nodePath,
						fieldKey: state.fieldKey,
						settings,
						schema: state.schema,
						setPropStatuses,
						clientId: previewServerState.clientId,
					})
				: callUpdateEffectKeyframeSettings({
						fileName: state.fileName,
						nodePath: state.nodePath,
						effectIndex: state.effectIndex,
						fieldKey: state.fieldKey,
						settings,
						schema: state.schema,
						setPropStatuses,
						clientId: previewServerState.clientId,
					});

		promise.then(close).finally(() => {
			setSaving(false);
		});
	}, [
		canEditClamping,
		canEditOutput,
		close,
		left,
		output,
		posterize,
		previewServerState,
		right,
		setPropStatuses,
		state,
	]);

	const saveDisabled = saving || previewServerState.type !== 'connected';

	return (
		<DismissableModal>
			<ModalHeader title={`Keyframe settings: ${state.fieldLabel}`} />
			<div style={container}>
				{canEditClamping ? (
					<>
						<div style={row}>
							<div style={label}>Extrapolate left</div>
							<Combobox
								values={leftOptions}
								selectedId={left}
								title="Extrapolate left"
								style={comboStyle}
							/>
						</div>
						<div style={row}>
							<div style={label}>Extrapolate right</div>
							<Combobox
								values={rightOptions}
								selectedId={right}
								title="Extrapolate right"
								style={comboStyle}
							/>
						</div>
						{canEditOutput ? (
							<div style={row}>
								<div style={label}>Output</div>
								<Combobox
									values={outputValues}
									selectedId={output}
									title="Output"
									style={comboStyle}
								/>
							</div>
						) : null}
					</>
				) : null}
				<div style={row}>
					<div>
						<div style={label}>Posterize</div>
						<div style={helperText}>Use 0 to turn posterization off.</div>
					</div>
					<InputDragger
						type="number"
						value={posterize}
						status="ok"
						onValueChange={onPosterizeChange}
						onValueChangeEnd={onPosterizeChange}
						onTextChange={() => undefined}
						min={0}
						step={1}
						formatter={posterizeFormatter}
						rightAlign
						style={posterizeInputStyle}
					/>
				</div>
			</div>
			<ModalFooterContainer>
				<Row justify="flex-end" align="center">
					<Button onClick={close}>Cancel</Button>
					<Spacing x={1} />
					<ModalButton onClick={onSave} disabled={saveDisabled}>
						Save
					</ModalButton>
				</Row>
			</ModalFooterContainer>
		</DismissableModal>
	);
};
