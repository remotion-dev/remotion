import React, {useMemo} from 'react';
import {Checkmark} from '../icons/Checkmark';
import {CONTROL_BUTTON_PADDING} from './ControlButton';
import {Combobox, ComboboxValue} from './NewComposition/ComboBox';

export const commonPlaybackRates: number[] = [
	-4, -2, -1, -0.5, -0.25, 0.25, 0.5, 1, 2, 4,
];

export const getPreviewSizeLabel = (playbackRate: number) => {
	return `${playbackRate}x`;
};

const accessibilityLabel = 'Change the playback rate';

const comboStyle: React.CSSProperties = {width: 80};

export const PlaybackRateSelector: React.FC<{
	playbackRate: number;
	setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
}> = ({playbackRate, setPlaybackRate}) => {
	const style = useMemo(() => {
		return {
			padding: CONTROL_BUTTON_PADDING,
		};
	}, []);

	const items: ComboboxValue[] = useMemo(() => {
		return commonPlaybackRates.map((newPlaybackRate): ComboboxValue => {
			return {
				id: String(newPlaybackRate),
				label: getPreviewSizeLabel(newPlaybackRate),
				onClick: () => {
					return setPlaybackRate(() => {
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
			};
		});
	}, [playbackRate, setPlaybackRate]);

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
