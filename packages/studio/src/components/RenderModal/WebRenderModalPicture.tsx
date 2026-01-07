import type {WebRendererQuality} from '@remotion/web-renderer';
import type React from 'react';
import {useCallback, useMemo} from 'react';
import {Checkbox} from '../Checkbox';
import {Combobox} from '../NewComposition/ComboBox';
import {label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';
import {getQualityOptions} from './quality-options';
import type {RenderType} from './WebRenderModal';

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
	readonly transparent: boolean;
	readonly setTransparent: React.Dispatch<React.SetStateAction<boolean>>;
};

export const WebRenderModalPicture: React.FC<WebRenderModalPictureProps> = ({
	renderMode,
	videoBitrate,
	setVideoBitrate,
	keyframeIntervalInSeconds,
	setKeyframeIntervalInSeconds,
	transparent,
	setTransparent,
}) => {
	const qualityOptions = useMemo(
		() => getQualityOptions(videoBitrate, setVideoBitrate),
		[videoBitrate, setVideoBitrate],
	);

	const onTransparentChanged = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setTransparent(e.target.checked);
		},
		[setTransparent],
	);

	if (renderMode !== 'video') {
		return null;
	}

	return (
		<div style={tabContainer}>
			<div style={optionRow}>
				<div style={label}>Quality</div>
				<div style={rightRow}>
					<Combobox
						values={qualityOptions}
						selectedId={videoBitrate}
						title="Quality"
					/>
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
			<div style={optionRow}>
				<div style={label}>Transparent</div>
				<div style={rightRow}>
					<Checkbox
						checked={transparent}
						onChange={onTransparentChanged}
						name="transparent"
					/>
				</div>
			</div>
		</div>
	);
};
