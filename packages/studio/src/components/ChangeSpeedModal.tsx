import React, {useCallback, useContext, useMemo, useState} from 'react';
import {LIGHT_TEXT, WHITE, WHITE_ALPHA_50} from '../helpers/colors';
import {formatMediaDuration} from '../helpers/format-media-duration';
import type {
	ChangeSpeedKeyframeTiming,
	ChangeSpeedModalState,
} from '../state/modals';
import {SetSelectedModalContext} from '../state/modals';
import {Button} from './Button';
import {Checkbox} from './Checkbox';
import {Flex, Row} from './layout';
import {ModalButton} from './ModalButton';
import {getMaxModalWidth} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {RadioButton} from './RadioButton';
import {label, optionRow, rightRow} from './RenderModal/layout';

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	display: 'flex',
	flexDirection: 'column',
	minWidth: 0,
	overflow: 'hidden',
	width: getMaxModalWidth(520),
};

const contentStyle: React.CSSProperties = {
	paddingBottom: 12,
	paddingTop: 8,
};

const inputContainerStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	width: 140,
};

const valueStyle: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 14,
};

const sectionStyle: React.CSSProperties = {
	borderTop: `1px solid ${WHITE_ALPHA_50}`,
	marginTop: 8,
	padding: '12px 16px 0',
};

const descriptionStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.5,
	margin: '0 0 8px',
};

const checkboxLabelStyle: React.CSSProperties = {
	alignItems: 'center',
	color: LIGHT_TEXT,
	cursor: 'default',
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 14,
	gap: 8,
	lineHeight: '20px',
};

const validationStyle: React.CSSProperties = {
	padding: '4px 16px 0',
};

const isClose = (first: number, second: number) =>
	Math.abs(first - second) <=
	Number.EPSILON * Math.max(1, Math.abs(first), Math.abs(second)) * 4;

export const ChangeSpeedModal: React.FC<{
	readonly state: ChangeSpeedModalState;
}> = ({state}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [speedPercent, setSpeedPercent] = useState(() =>
		String(state.initialPlaybackRate * 100),
	);
	const [preservePitch, setPreservePitch] = useState(
		state.initialPreservePitch,
	);
	const [keyframeTiming, setKeyframeTiming] =
		useState<ChangeSpeedKeyframeTiming>('follow-footage');
	const [submitting, setSubmitting] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const playbackRate = Number(speedPercent) / 100;
	const sourceSpanInFrames =
		state.timelineDurationInFrames * state.sequencePlaybackRate * playbackRate;
	const sourceEndInFrames = state.sourceStartInFrames + sourceSpanInFrames;

	const validationMessage = useMemo(() => {
		if (!Number.isFinite(playbackRate) || playbackRate < 0.1) {
			return 'Enter a speed of at least 10%.';
		}

		if (
			state.hasAudio &&
			state.pitchCanBeChanged &&
			!preservePitch &&
			playbackRate > 2
		) {
			return 'Pitch can follow speed up to 200%. Preserve pitch or enter a lower speed.';
		}

		if (state.sourceStartInFrames < 0) {
			return 'The clip starts before the beginning of the source media.';
		}

		if (
			!Number.isFinite(sourceEndInFrames) ||
			sourceEndInFrames > state.mediaDurationInFrames + 0.0001
		) {
			const availableSeconds = Math.max(
				0,
				(state.mediaDurationInFrames - state.sourceStartInFrames) / state.fps,
			);
			return `This speed needs ${formatMediaDuration(sourceSpanInFrames / state.fps)} of source media, but only ${formatMediaDuration(availableSeconds)} is available.`;
		}

		return null;
	}, [
		playbackRate,
		preservePitch,
		sourceEndInFrames,
		sourceSpanInFrames,
		state,
	]);

	const dismiss = useCallback(() => {
		if (!submitting) {
			setSelectedModal(null);
		}
	}, [setSelectedModal, submitting]);

	const apply = useCallback(async () => {
		if (validationMessage !== null || submitting) {
			return;
		}

		setSubmitting(true);
		setSaveError(null);
		try {
			await state.onApply({playbackRate, preservePitch, keyframeTiming});
			setSelectedModal(null);
		} catch (error) {
			setSaveError((error as Error).message);
			setSubmitting(false);
		}
	}, [
		keyframeTiming,
		playbackRate,
		preservePitch,
		setSelectedModal,
		state,
		submitting,
		validationMessage,
	]);

	const sourceRange = Number.isFinite(sourceEndInFrames)
		? `${formatMediaDuration(state.sourceStartInFrames / state.fps)} – ${formatMediaDuration(sourceEndInFrames / state.fps)}`
		: '—';
	const speedChanged = !isClose(playbackRate, state.initialPlaybackRate);

	return (
		<DismissableModal panelStyle={panelStyle} ariaLabel="Change speed">
			<ModalHeader
				title={`Change speed${state.displayName ? `: ${state.displayName}` : ''}`}
				onClose={dismiss}
			/>
			<div>
				<div style={contentStyle}>
					<div style={optionRow}>
						<label htmlFor="change-speed-percentage" style={label}>
							Speed
						</label>
						<div style={rightRow}>
							<div style={inputContainerStyle}>
								<RemotionInput
									autoFocus
									disabled={submitting}
									id="change-speed-percentage"
									min={10}
									onChange={(event) => setSpeedPercent(event.target.value)}
									rightAlign
									status={validationMessage === null ? 'ok' : 'error'}
									step="any"
									type="number"
									value={speedPercent}
								/>
								<span style={valueStyle}>%</span>
							</div>
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>Timeline length</div>
						<div style={rightRow}>
							<span style={valueStyle}>
								{formatMediaDuration(
									state.timelineDurationInFrames / state.fps,
								)}
							</span>
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>Source range</div>
						<div style={rightRow}>
							<span style={valueStyle}>{sourceRange}</span>
						</div>
					</div>
					{validationMessage ? (
						<div style={validationStyle}>
							<ValidationMessage
								align="flex-start"
								message={validationMessage}
								type="error"
							/>
						</div>
					) : null}
					{state.hasAudio ? (
						<div style={sectionStyle}>
							<label style={checkboxLabelStyle}>
								<Checkbox
									checked={preservePitch}
									disabled={!state.pitchCanBeChanged || submitting}
									name="preserve-pitch"
									onChange={(event) => setPreservePitch(event.target.checked)}
								/>
								Preserve pitch
							</label>
							<p style={descriptionStyle}>
								{state.pitchDescription ??
									(preservePitch
										? 'Keep the original pitch while changing speed.'
										: 'Let pitch rise or fall with the playback speed.')}
							</p>
						</div>
					) : null}
					{state.hasEditableKeyframes ? (
						<div
							aria-label="Keyframe timing"
							role="radiogroup"
							style={sectionStyle}
						>
							<p style={descriptionStyle}>Keyframe timing</p>
							<RadioButton
								checked={keyframeTiming === 'follow-footage'}
								disabled={submitting}
								onClick={() => setKeyframeTiming('follow-footage')}
							>
								Follow footage — move keyframes with source content
							</RadioButton>
							<RadioButton
								checked={keyframeTiming === 'maintain-timing'}
								disabled={submitting}
								onClick={() => setKeyframeTiming('maintain-timing')}
							>
								Maintain timing — keep keyframes at timeline times
							</RadioButton>
						</div>
					) : null}
					{saveError ? (
						<div style={validationStyle}>
							<ValidationMessage
								align="flex-start"
								message={saveError}
								type="error"
							/>
						</div>
					) : null}
				</div>
				<ModalFooterContainer>
					<Row align="center">
						<Flex />
						<Button disabled={submitting} onClick={dismiss}>
							Cancel
						</Button>
						<ModalButton
							disabled={
								submitting ||
								validationMessage !== null ||
								(!speedChanged && preservePitch === state.initialPreservePitch)
							}
							onClick={apply}
						>
							{submitting ? 'Applying...' : 'Apply'}
						</ModalButton>
					</Row>
				</ModalFooterContainer>
			</div>
		</DismissableModal>
	);
};
