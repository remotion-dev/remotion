import React, {useCallback, useContext, useMemo, useState} from 'react';
import {LIGHT_TEXT, WHITE, WHITE_ALPHA_50} from '../helpers/colors';
import {formatMediaDuration} from '../helpers/format-media-duration';
import type {
	ChangeSpeedKeyframeTiming,
	ChangeSpeedModalState,
} from '../state/modals';
import {SetSelectedModalContext} from '../state/modals';
import {Button} from './Button';
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
	const [keyframeTiming, setKeyframeTiming] =
		useState<ChangeSpeedKeyframeTiming>('follow-content');
	const [submitting, setSubmitting] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const playbackRate = Number(speedPercent) / 100;
	const contentSpanInFrames =
		state.timelineDurationInFrames * state.parentPlaybackRate * playbackRate;
	const contentEndInFrames = state.contentStartInFrames + contentSpanInFrames;

	const validationMessage = useMemo(() => {
		if (!Number.isFinite(playbackRate) || playbackRate < 0.01) {
			return 'Enter a speed of at least 1%.';
		}

		if (state.mediaDurationInFrames === null) {
			return null;
		}

		if (state.contentStartInFrames < 0) {
			return 'The clip starts before the beginning of the source media.';
		}

		if (
			!Number.isFinite(contentEndInFrames) ||
			contentEndInFrames > state.mediaDurationInFrames + 0.0001
		) {
			const availableSeconds = Math.max(
				0,
				(state.mediaDurationInFrames - state.contentStartInFrames) / state.fps,
			);
			return `This speed needs ${formatMediaDuration(contentSpanInFrames / state.fps)} of source media, but only ${formatMediaDuration(availableSeconds)} is available.`;
		}

		return null;
	}, [contentEndInFrames, contentSpanInFrames, playbackRate, state]);

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
			await state.onApply({playbackRate, keyframeTiming});
			setSelectedModal(null);
		} catch (error) {
			setSaveError((error as Error).message);
			setSubmitting(false);
		}
	}, [
		keyframeTiming,
		playbackRate,
		setSelectedModal,
		state,
		submitting,
		validationMessage,
	]);

	const contentRange = Number.isFinite(contentEndInFrames)
		? `${formatMediaDuration(state.contentStartInFrames / state.fps)} – ${formatMediaDuration(contentEndInFrames / state.fps)}`
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
									min={1}
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
						<div style={label}>
							{state.mediaDurationInFrames === null
								? 'Child range'
								: 'Source range'}
						</div>
						<div style={rightRow}>
							<span style={valueStyle}>{contentRange}</span>
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
					{state.hasEditableKeyframes ? (
						<div
							aria-label="Keyframe timing"
							role="radiogroup"
							style={sectionStyle}
						>
							<p style={descriptionStyle}>Keyframe timing</p>
							<RadioButton
								checked={keyframeTiming === 'follow-content'}
								disabled={submitting}
								onClick={() => setKeyframeTiming('follow-content')}
							>
								Follow content — move keyframes with the child clock
							</RadioButton>
							<RadioButton
								checked={keyframeTiming === 'maintain-timing'}
								disabled={submitting}
								onClick={() => setKeyframeTiming('maintain-timing')}
							>
								Maintain timing — keep keyframes at parent timeline times
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
								submitting || validationMessage !== null || !speedChanged
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
