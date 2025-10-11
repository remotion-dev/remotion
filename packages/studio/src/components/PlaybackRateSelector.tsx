import React, {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {useIsStill} from '../helpers/is-current-selected-still';
import {Checkmark} from '../icons/Checkmark';
import {persistPlaybackRate} from '../state/playbackrate';
import {CONTROL_BUTTON_PADDING} from './ControlButton';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';

const commonPlaybackRates: number[] = [
	-4, -2, -1, -0.5, -0.25, 0.25, 0.5, 1, 1.5, 2, 4,
];

const getPlaybackRateLabel = (playbackRate: number) => {
	return `${playbackRate}x`;
};

const accessibilityLabel = 'Change the playback rate';

const comboStyle: React.CSSProperties = {width: 80};

export const PlaybackRateSelector: React.FC<{
	readonly playbackRate: number;
	readonly setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
}> = ({playbackRate, setPlaybackRate}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const isStill = useIsStill();
	const style = useMemo(() => {
		return {
			padding: CONTROL_BUTTON_PADDING,
		};
	}, []);

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

	if (isStill || canvasContent === null || canvasContent.type === 'asset') {
		return null;
	}

	return (
		<div style={style} aria-label={accessibilityLabel}>
			<Combobox
				title={accessibilityLabel}
				style={comboStyle}
				selectedId={String(playbackRate)}
				values={items}
			/>
		</div>
	);
};
