import type {WebRendererQuality} from '@remotion/web-renderer';
import type React from 'react';
import {useMemo} from 'react';
import {Checkmark} from '../../icons/Checkmark';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import type {RenderType} from './WebRenderModal';
import {label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';

const tabContainer: React.CSSProperties = {
	flex: 1,
};

type WebRenderModalPictureProps = {
	readonly renderMode: RenderType;
	readonly videoBitrate: WebRendererQuality;
	readonly setVideoBitrate: (quality: WebRendererQuality) => void;
	readonly keyframeIntervalInSeconds: number;
	readonly setKeyframeIntervalInSeconds: React.Dispatch<
		React.SetStateAction<number>
	>;
};

export const WebRenderModalPicture: React.FC<
	WebRenderModalPictureProps
> = ({
	renderMode,
	videoBitrate,
	setVideoBitrate,
	keyframeIntervalInSeconds,
	setKeyframeIntervalInSeconds,
}) => {
	const qualityOptions = useMemo((): ComboboxValue[] => {
		return [
			{
				label: 'Very Low',
				onClick: () => setVideoBitrate('very-low'),
				leftItem: videoBitrate === 'very-low' ? <Checkmark /> : null,
				id: 'very-low',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'very-low',
			},
			{
				label: 'Low',
				onClick: () => setVideoBitrate('low'),
				leftItem: videoBitrate === 'low' ? <Checkmark /> : null,
				id: 'low',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'low',
			},
			{
				label: 'Medium',
				onClick: () => setVideoBitrate('medium'),
				leftItem: videoBitrate === 'medium' ? <Checkmark /> : null,
				id: 'medium',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'medium',
			},
			{
				label: 'High',
				onClick: () => setVideoBitrate('high'),
				leftItem: videoBitrate === 'high' ? <Checkmark /> : null,
				id: 'high',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'high',
			},
			{
				label: 'Very High',
				onClick: () => setVideoBitrate('very-high'),
				leftItem: videoBitrate === 'very-high' ? <Checkmark /> : null,
				id: 'very-high',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'very-high',
			},
		];
	}, [videoBitrate, setVideoBitrate]);

	if (renderMode !== 'video') {
		return null;
	}

	return (
		<div style={tabContainer}>
			<div style={optionRow}>
				<div style={label}>Quality</div>
				<div style={rightRow}>
					<Combobox values={qualityOptions} selectedId={videoBitrate} title="Quality" />
				</div>
			</div>
			<NumberSetting
				name="Keyframe Interval"
				formatter={(v) => `${v}s`}
				min={1}
				max={300}
				step={1}
				value={keyframeIntervalInSeconds}
				onValueChanged={setKeyframeIntervalInSeconds}
			/>
		</div>
	);
};
