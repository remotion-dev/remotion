import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT, WHITE_ALPHA_80} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {Checkmark} from '../icons/Checkmark';
import {PlaybackRateIcon} from '../icons/playback-rate';
import {commonPlaybackRates, persistPlaybackRate} from '../state/playbackrate';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {InputDragger} from './NewComposition/InputDragger';
import {TimelineCombobox} from './TimelineCombobox';

const getPlaybackRateLabel = (playbackRate: number) => {
	return `${Number(playbackRate.toFixed(5))}x`;
};

const accessibilityLabel = 'Playback rate';

const customRateRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 12,
	padding: '4px 12px 8px',
};

const customRateLabelStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
};

type PlaybackRateMenuItemsProps = {
	readonly playbackRate: number;
	readonly setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
};

const CustomPlaybackRateItem: React.FC<PlaybackRateMenuItemsProps> = ({
	playbackRate,
	setPlaybackRate,
}) => {
	const setRate = (rate: number) => {
		if (!Number.isFinite(rate) || rate === 0 || Math.abs(rate) > 4) {
			return;
		}

		persistPlaybackRate(rate);
		setPlaybackRate(rate);
	};

	return (
		<div style={customRateRowStyle}>
			<span style={customRateLabelStyle}>Custom rate</span>
			<InputDragger
				aria-label="Custom playback rate"
				allowStepMismatch
				max={4}
				min={-4}
				onTextChange={() => undefined}
				onValueChange={setRate}
				onValueChangeEnd={setRate}
				rightAlign
				small
				status="ok"
				step={0.01}
				style={{width: 88}}
				type="number"
				value={playbackRate}
				formatter={(rate) => getPlaybackRateLabel(Number(rate))}
			/>
		</div>
	);
};

const usePlaybackRateMenuItems = ({
	playbackRate,
	setPlaybackRate,
}: PlaybackRateMenuItemsProps) => {
	const items: ComboboxValue[] = useMemo(() => {
		const divider: ComboboxValue = {
			type: 'divider',
			id: 'divider',
		};
		const values = commonPlaybackRates.map((newPlaybackRate): ComboboxValue => {
			return {
				id: String(newPlaybackRate),
				label: getPlaybackRateLabel(newPlaybackRate),
				onClick: () => {
					return setPlaybackRate(() => {
						persistPlaybackRate(newPlaybackRate);
						return newPlaybackRate;
					});
				},
				type: 'item',
				value: newPlaybackRate,
				keyHint: null,
				leftItem:
					String(playbackRate) === String(newPlaybackRate) ? (
						<Checkmark />
					) : null,
				subMenu: null,
				quickSwitcherLabel: null,
			};
		});
		const middle = Math.floor(commonPlaybackRates.length / 2);
		return [
			...values.slice(0, middle),
			divider,
			...values.slice(middle),
			{
				id: 'custom-rate-divider',
				type: 'divider',
			},
			{
				id: 'custom-playback-rate',
				type: 'custom',
				content: (
					<CustomPlaybackRateItem
						playbackRate={playbackRate}
						setPlaybackRate={setPlaybackRate}
					/>
				),
			},
		];
	}, [playbackRate, setPlaybackRate]);

	return {
		items,
		selectedId: String(playbackRate),
	};
};

export const PlaybackRateSelector: React.FC<PlaybackRateMenuItemsProps> = ({
	playbackRate,
	setPlaybackRate,
}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const isStill = useIsStill();
	const {items, selectedId} = usePlaybackRateMenuItems({
		playbackRate,
		setPlaybackRate,
	});

	if (isStill || canvasContent === null) {
		return null;
	}

	return (
		<TimelineCombobox
			aria-label={accessibilityLabel}
			tooltipDelay={800}
			labelWidth={48}
			selectedId={selectedId}
			selectedLabel={getPlaybackRateLabel(playbackRate)}
			values={items}
			renderLeftItem={(color) => (
				<PlaybackRateIcon color={color} playbackRate={playbackRate} />
			)}
			unhoveredIconColor={WHITE_ALPHA_80}
		/>
	);
};
