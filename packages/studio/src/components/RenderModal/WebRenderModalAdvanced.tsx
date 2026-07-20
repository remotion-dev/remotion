import type {WebRendererPageResponsiveness} from '@remotion/web-renderer';
import type React from 'react';
import {useCallback, useMemo} from 'react';
import {Checkmark} from '../../icons/Checkmark';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';
import {
	WebRendererCustomOptionExplainerBubble,
	WebRendererOptionExplainerBubble,
} from './OptionExplainerBubble';
import type {RenderType} from './WebRenderModal';

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
	readonly pageResponsiveness: WebRendererPageResponsiveness;
	readonly setPageResponsiveness: React.Dispatch<
		React.SetStateAction<WebRendererPageResponsiveness>
	>;
};

const tabContainer: React.CSSProperties = {
	flex: 1,
};

const paragraph: React.CSSProperties = {
	margin: 0,
	marginBottom: 8,
};

const lastParagraph: React.CSSProperties = {
	margin: 0,
};

const PageResponsivenessDescription: React.FC = () => {
	return (
		<>
			<p style={paragraph}>
				The Web Renderer runs in the same browser tab as the Studio. Rendering
				can block the tab while Remotion captures frames.
			</p>
			<p style={paragraph}>
				The default is <code>Medium</code>, which tries to free the event loop
				every 33ms of rendering work so progress updates and UI interactions can
				stay responsive.
			</p>
			<p style={lastParagraph}>
				Choose <code>Disabled</code> to prioritize render speed, or{' '}
				<code>High</code> to give the browser more chances to update.
			</p>
		</>
	);
};

export const WebRenderModalAdvanced: React.FC<WebRenderModalAdvancedProps> = ({
	renderMode,
	delayRenderTimeout,
	setDelayRenderTimeout,
	mediaCacheSizeInBytes,
	setMediaCacheSizeInBytes,
	hardwareAcceleration,
	setHardwareAcceleration,
	pageResponsiveness,
	setPageResponsiveness,
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

	const hardwareAccelerationOptions = useMemo((): ComboboxValue[] => {
		return [
			{
				label: 'No Preference',
				onClick: () => setHardwareAcceleration('no-preference'),
				leftItem:
					hardwareAcceleration === 'no-preference' ? <Checkmark /> : null,
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
				leftItem:
					hardwareAcceleration === 'prefer-hardware' ? <Checkmark /> : null,
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
				leftItem:
					hardwareAcceleration === 'prefer-software' ? <Checkmark /> : null,
				id: 'prefer-software',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'prefer-software',
			},
		];
	}, [hardwareAcceleration, setHardwareAcceleration]);

	const selectedPageResponsiveness =
		typeof pageResponsiveness === 'number' ? 'custom' : pageResponsiveness;

	const pageResponsivenessOptions = useMemo((): ComboboxValue[] => {
		return [
			{
				label: 'Disabled',
				onClick: () => setPageResponsiveness('disabled'),
				leftItem:
					selectedPageResponsiveness === 'disabled' ? <Checkmark /> : null,
				id: 'disabled',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'disabled',
			},
			{
				label: 'Low (100ms)',
				onClick: () => setPageResponsiveness('low'),
				leftItem: selectedPageResponsiveness === 'low' ? <Checkmark /> : null,
				id: 'low',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'low',
			},
			{
				label: 'Medium (33ms)',
				onClick: () => setPageResponsiveness('medium'),
				leftItem:
					selectedPageResponsiveness === 'medium' ? <Checkmark /> : null,
				id: 'medium',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'medium',
			},
			{
				label: 'High (16ms)',
				onClick: () => setPageResponsiveness('high'),
				leftItem: selectedPageResponsiveness === 'high' ? <Checkmark /> : null,
				id: 'high',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'high',
			},
			{
				label: 'Custom',
				onClick: () =>
					setPageResponsiveness((previous) =>
						typeof previous === 'number' ? previous : 33,
					),
				leftItem:
					selectedPageResponsiveness === 'custom' ? <Checkmark /> : null,
				id: 'custom',
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'custom',
			},
		];
	}, [selectedPageResponsiveness, setPageResponsiveness]);

	const setCustomPageResponsiveness: React.Dispatch<
		React.SetStateAction<number>
	> = useCallback(
		(value) => {
			setPageResponsiveness((previous) => {
				const currentValue = typeof previous === 'number' ? previous : 33;
				return typeof value === 'function' ? value(currentValue) : value;
			});
		},
		[setPageResponsiveness],
	);

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
					<WebRendererOptionExplainerBubble
						apiName="mediaCacheSizeInBytes"
						id="mediaCacheSizeInBytesOption"
					/>
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

			{renderMode === 'video' ? (
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
			) : null}

			{renderMode === 'still' ? null : (
				<>
					<div style={optionRow}>
						<div style={label}>
							Page Responsiveness <Spacing x={0.5} />
							<WebRendererCustomOptionExplainerBubble
								apiName="pageResponsiveness"
								description={<PageResponsivenessDescription />}
								docLink="https://www.remotion.dev/docs/client-side-rendering/page-responsiveness"
								name="Page responsiveness"
							/>
						</div>
						<div style={rightRow}>
							<Combobox
								values={pageResponsivenessOptions}
								selectedId={selectedPageResponsiveness}
								title="Page Responsiveness"
							/>
						</div>
					</div>
					{typeof pageResponsiveness === 'number' ? (
						<NumberSetting
							name="Responsiveness Interval"
							formatter={(v) => `${v}ms`}
							min={1}
							max={1000000000}
							step={1}
							value={pageResponsiveness}
							onValueChanged={setCustomPageResponsiveness}
						/>
					) : null}
				</>
			)}
		</div>
	);
};
