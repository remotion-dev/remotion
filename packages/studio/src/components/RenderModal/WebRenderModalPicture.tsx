import type {WebRendererQuality} from '@remotion/web-renderer';
import type React from 'react';
import {useCallback, useMemo} from 'react';
import {Checkbox} from '../Checkbox';
import {Combobox} from '../NewComposition/ComboBox';
import {label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';
import {getQualityOptions} from './quality-options';
import {ScaleSetting} from './ScaleSetting';
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
	readonly scale: number;
	readonly setScale: React.Dispatch<React.SetStateAction<number>>;
	readonly compositionWidth: number;
	readonly compositionHeight: number;
};

export const WebRenderModalPicture: React.FC<WebRenderModalPictureProps> = ({
	renderMode,
	videoBitrate,
	setVideoBitrate,
	keyframeIntervalInSeconds,
	setKeyframeIntervalInSeconds,
	transparent,
	setTransparent,
	scale,
	setScale,
	compositionWidth,
	compositionHeight,
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

	return (
		<div style={tabContainer}>
			<ScaleSetting
				scale={scale}
				setScale={setScale}
				compositionWidth={compositionWidth}
				compositionHeight={compositionHeight}
			/>
			{renderMode !== 'video' ? null : (
				<>
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
				</>
			)}
		</div>
	);
};
