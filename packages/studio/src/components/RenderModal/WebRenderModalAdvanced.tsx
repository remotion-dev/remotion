import type {LogLevel} from '@remotion/renderer';
import type React from 'react';
import {useCallback, useMemo} from 'react';
import {Checkmark} from '../../icons/Checkmark';
import {Spacing} from '../layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {Checkbox} from '../Checkbox';
import type {RenderType} from './WebRenderModal';
import {label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';

type WebRenderModalAdvancedProps = {
	readonly renderMode: RenderType;
	readonly delayRenderTimeout: number;
	readonly setDelayRenderTimeout: React.Dispatch<React.SetStateAction<number>>;
	readonly mediaCacheSizeInBytes: number | null;
	readonly setMediaCacheSizeInBytes: React.Dispatch<
		React.SetStateAction<number | null>
	>;
	readonly hardwareAcceleration:
		| 'no-preference'
		| 'prefer-hardware'
		| 'prefer-software';
	readonly setHardwareAcceleration: (
		value: 'no-preference' | 'prefer-hardware' | 'prefer-software',
	) => void;
	readonly keyframeIntervalInSeconds: number;
	readonly setKeyframeIntervalInSeconds: React.Dispatch<
		React.SetStateAction<number>
	>;
	readonly logLevel: LogLevel;
	readonly setLogLevel: (level: LogLevel) => void;
};

const tabContainer: React.CSSProperties = {
	flex: 1,
};

export const WebRenderModalAdvanced: React.FC<
	WebRenderModalAdvancedProps
> = ({
	renderMode,
	delayRenderTimeout,
	setDelayRenderTimeout,
	mediaCacheSizeInBytes,
	setMediaCacheSizeInBytes,
	hardwareAcceleration,
	setHardwareAcceleration,
	keyframeIntervalInSeconds,
	setKeyframeIntervalInSeconds,
	logLevel,
	setLogLevel,
}) => {
	const toggleCustomMediaCacheSizeInBytes = useCallback(() => {
		setMediaCacheSizeInBytes((previous) => {
			if (previous === null) {
				return 1000 * 1000 * 1000;
			}

			return null;
		});
	}, [setMediaCacheSizeInBytes]);

	const changeMediaCacheSizeInBytes: React.Dispatch<
		React.SetStateAction<number>
	> = useCallback(
		(cb) => {
			setMediaCacheSizeInBytes((prev) => {
				if (prev === null) {
					throw new TypeError('Expected previous value');
				}

				if (typeof cb === 'function') {
					return cb(prev);
				}

				return cb;
			});
		},
		[setMediaCacheSizeInBytes],
	);

	const onVerboseLoggingChanged = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setLogLevel(e.target.checked ? 'verbose' : 'info');
		},
		[setLogLevel],
	);

	const hardwareAccelerationOptions = useMemo((): ComboboxValue[] => {
		return [
			{
				label: 'No Preference',
				onClick: () => setHardwareAcceleration('no-preference'),
				leftItem: hardwareAcceleration === 'no-preference' ? <Checkmark /> : null,
				id: 'no-preference',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'no-preference',
			},
			{
				label: 'Prefer Hardware',
				onClick: () => setHardwareAcceleration('prefer-hardware'),
				leftItem: hardwareAcceleration === 'prefer-hardware' ? <Checkmark /> : null,
				id: 'prefer-hardware',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'prefer-hardware',
			},
			{
				label: 'Prefer Software',
				onClick: () => setHardwareAcceleration('prefer-software'),
				leftItem: hardwareAcceleration === 'prefer-software' ? <Checkmark /> : null,
				id: 'prefer-software',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'prefer-software',
			},
		];
	}, [hardwareAcceleration, setHardwareAcceleration]);

	return (
		<div style={tabContainer}>
			<NumberSetting
				name="Delay Render Timeout"
				formatter={(v) => `${v}ms`}
				min={0}
				max={1000000000}
				step={1000}
				value={delayRenderTimeout}
				onValueChanged={setDelayRenderTimeout}
				hint="delayRenderTimeoutInMillisecondsOption"
			/>
			<div style={optionRow}>
				<div style={label}>
					Custom @remotion/media cache size <Spacing x={0.5} />
					<OptionExplainerBubble id="mediaCacheSizeInBytesOption" />
				</div>
				<div style={rightRow}>
					<Checkbox
						checked={mediaCacheSizeInBytes !== null}
						onChange={toggleCustomMediaCacheSizeInBytes}
						name="media-cache-size"
					/>
				</div>
			</div>

			{mediaCacheSizeInBytes === null ? null : (
				<NumberSetting
					name="@remotion/media cache size"
					formatter={(w) => `${w} bytes`}
					min={0}
					max={10000000000}
					step={10 * 1024 * 1024}
					value={mediaCacheSizeInBytes}
					onValueChanged={changeMediaCacheSizeInBytes}
				/>
			)}

			<div style={optionRow}>
				<div style={label}>
					Verbose logging <Spacing x={0.5} />
					<OptionExplainerBubble id="logLevelOption" />
				</div>
				<div style={rightRow}>
					<Checkbox
						checked={logLevel === 'verbose'}
						onChange={onVerboseLoggingChanged}
						name="verbose-logging"
					/>
				</div>
			</div>

			{renderMode === 'video' ? (
				<>
					<div style={optionRow}>
						<div style={label}>Hardware Acceleration</div>
						<div style={rightRow}>
							<Combobox
								values={hardwareAccelerationOptions}
								selectedId={hardwareAcceleration}
								title="Hardware Acceleration"
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
				</>
			) : null}
		</div>
	);
};
