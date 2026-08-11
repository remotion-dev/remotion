import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {WHITE_ALPHA_80} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {Checkmark} from '../icons/Checkmark';
import {PlaybackRateIcon} from '../icons/playback-rate';
import {persistPlaybackRate} from '../state/playbackrate';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {TimelineCombobox} from './TimelineCombobox';

const commonPlaybackRates: number[] = [
	-4, -2, -1, -0.5, -0.25, 0.25, 0.5, 1, 1.5, 2, 4,
];

const getPlaybackRateLabel = (playbackRate: number) => {
	return `${playbackRate}x`;
};

const accessibilityLabel = 'Change the playback rate';

type PlaybackRateMenuItemsProps = {
	readonly playbackRate: number;
	readonly setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
};

export const usePlaybackRateMenuItems = ({
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
		return [...values.slice(0, middle), divider, ...values.slice(middle)];
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

	if (isStill || canvasContent === null || canvasContent.type === 'asset') {
		return null;
	}

	return (
		<TimelineCombobox
			title={accessibilityLabel}
			labelWidth={30}
			selectedId={selectedId}
			values={items}
			renderLeftItem={(color) => (
				<PlaybackRateIcon color={color} playbackRate={playbackRate} />
			)}
			unhoveredIconColor={WHITE_ALPHA_80}
		/>
	);
};
