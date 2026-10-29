import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {WHITE, WHITE_ALPHA_80} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {Checkmark} from '../icons/Checkmark';
import {Minus} from '../icons/minus';
import {PlaybackRateIcon} from '../icons/playback-rate';
import {Plus} from '../icons/plus';
import {
	commonPlaybackRates,
	persistPlaybackRate,
	stepPlaybackRate,
} from '../state/playbackrate';
import {InlineAction} from './InlineAction';
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
	padding: '4px 8px',
};

const customRateValueStyle: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	justifyContent: 'center',
};

const stepIconStyle: React.CSSProperties = {
	height: 14,
};

type PlaybackRateMenuItemsProps = {
	readonly playbackRate: number;
	readonly setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
};

const CustomPlaybackRateItem: React.FC<PlaybackRateMenuItemsProps> = ({
	playbackRate,
	setPlaybackRate,
}) => {
	const setRate = (value: number) => {
		const rate = Math.round(value * 100) / 100;
		if (!Number.isFinite(rate) || rate === 0 || Math.abs(rate) > 4) {
			return;
		}

		persistPlaybackRate(rate);
		setPlaybackRate(rate);
	};

	return (
		<div style={customRateRowStyle}>
			<InlineAction
				aria-label="Decrease playback rate"
				onClick={() => setRate(stepPlaybackRate(playbackRate, -1))}
				renderAction={(color) => <Minus color={color} style={stepIconStyle} />}
				style={{width: 20, marginLeft: -2}}
				unhoveredColor={WHITE}
				variant={null}
			/>
			<div style={customRateValueStyle}>
				<InputDragger
					aria-label="Custom playback rate"
					allowStepMismatch
					buttonStyle={{textAlign: 'center'}}
					max={4}
					min={-4}
					onTextChange={() => undefined}
					onValueChange={setRate}
					onValueChangeEnd={setRate}
					rightAlign={false}
					small
					status="ok"
					step={0.01}
					style={{width: 64}}
					type="number"
					value={playbackRate}
					formatter={(rate) => getPlaybackRateLabel(Number(rate))}
					formatterStyle={{color: WHITE}}
				/>
			</div>
			<InlineAction
				aria-label="Increase playback rate"
				onClick={() => setRate(stepPlaybackRate(playbackRate, 1))}
				renderAction={(color) => <Plus color={color} style={stepIconStyle} />}
				style={{width: 20, marginRight: -2}}
				unhoveredColor={WHITE}
				variant={null}
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
			labelWidth={30}
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
