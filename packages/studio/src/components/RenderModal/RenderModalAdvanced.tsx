import type {Codec, LogLevel, X264Preset} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ChangeEvent} from 'react';
import React, {useCallback, useMemo} from 'react';
import {labelx264Preset} from '../../helpers/presets-labels';

import {Checkmark} from '../../icons/Checkmark';
import type {UiOpenGlOptions} from '../../required-chromium-options';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {RemotionInput} from '../NewComposition/RemInput';
import {input, label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import {RenderModalEnvironmentVariables} from './RenderModalEnvironmentVariables';
import {RenderModalHr} from './RenderModalHr';

export type RenderType = 'still' | 'video' | 'audio' | 'sequence';

const container: React.CSSProperties = {
	flex: 1,
	overflowY: 'auto',
};

export const RenderModalAdvanced: React.FC<{
	renderMode: RenderType;
	minConcurrency: number;
	maxConcurrency: number;
	setConcurrency: React.Dispatch<React.SetStateAction<number>>;
	concurrency: number;
	setVerboseLogging: React.Dispatch<React.SetStateAction<LogLevel>>;
	logLevel: LogLevel;
	delayRenderTimeout: number;
	setDelayRenderTimeout: React.Dispatch<React.SetStateAction<number>>;
	disallowParallelEncoding: boolean;
	setDisallowParallelEncoding: React.Dispatch<React.SetStateAction<boolean>>;
	setDisableWebSecurity: React.Dispatch<React.SetStateAction<boolean>>;
	setIgnoreCertificateErrors: React.Dispatch<React.SetStateAction<boolean>>;
	setHeadless: React.Dispatch<React.SetStateAction<boolean>>;
	headless: boolean;
	ignoreCertificateErrors: boolean;
	disableWebSecurity: boolean;
	openGlOption: UiOpenGlOptions;
	setOpenGlOption: React.Dispatch<React.SetStateAction<UiOpenGlOptions>>;
	envVariables: [string, string][];
	setEnvVariables: React.Dispatch<React.SetStateAction<[string, string][]>>;
	x264Preset: X264Preset | null;
	setx264Preset: React.Dispatch<React.SetStateAction<X264Preset>>;
	offthreadVideoCacheSizeInBytes: number | null;
	setOffthreadVideoCacheSizeInBytes: React.Dispatch<
		React.SetStateAction<number | null>
	>;
	codec: Codec;
	enableMultiProcessOnLinux: boolean;
	setChromiumMultiProcessOnLinux: React.Dispatch<React.SetStateAction<boolean>>;
	userAgent: string | null;
	setUserAgent: React.Dispatch<React.SetStateAction<string | null>>;
	setBeep: React.Dispatch<React.SetStateAction<boolean>>;
	beep: boolean;
}> = ({
	renderMode,
	maxConcurrency,
	minConcurrency,
	setConcurrency,
	concurrency,
	setVerboseLogging,
	logLevel,
	delayRenderTimeout,
	setDelayRenderTimeout,
	disallowParallelEncoding,
	setDisallowParallelEncoding,
	setDisableWebSecurity,
	setIgnoreCertificateErrors,
	setHeadless,
	headless,
	ignoreCertificateErrors,
	disableWebSecurity,
	openGlOption,
	setOpenGlOption,
	setEnvVariables,
	envVariables,
	setx264Preset,
	x264Preset,
	codec,
	offthreadVideoCacheSizeInBytes,
	setOffthreadVideoCacheSizeInBytes,
	enableMultiProcessOnLinux,
	setChromiumMultiProcessOnLinux,
	setUserAgent,
	userAgent,
	beep,
	setBeep,
}) => {
	const extendedOpenGlOptions: UiOpenGlOptions[] = useMemo(() => {
		return [
			'angle',
			'egl',
			'swangle',
			'swiftshader',
			'vulkan',
			'angle-egl',
			'default',
		];
	}, []);
	const onVerboseLoggingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setVerboseLogging(e.target.checked ? 'verbose' : 'info');
		},
		[setVerboseLogging],
	);

	const toggleCustomOffthreadVideoCacheSizeInBytes = useCallback(() => {
		setOffthreadVideoCacheSizeInBytes((previous) => {
			if (previous === null) {
				return 512 * 1024 * 1024;
			}

			return null;
		});
	}, [setOffthreadVideoCacheSizeInBytes]);

	const toggleCustomUserAgent = useCallback(() => {
		setUserAgent((previous) => {
			if (previous === null) {
				return 'Mozilla/5.0 (Remotion)';
			}

			return null;
		});
	}, [setUserAgent]);

	const onDisallowParallelEncodingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setDisallowParallelEncoding(e.target.checked);
		},
		[setDisallowParallelEncoding],
	);

	const onDisableWebSecurityChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setDisableWebSecurity(e.target.checked);
		},
		[setDisableWebSecurity],
	);

	const onEnableMultiProcessOnLinux = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setChromiumMultiProcessOnLinux(e.target.checked);
		},
		[setChromiumMultiProcessOnLinux],
	);

	const onIgnoreCertificatErrors = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setIgnoreCertificateErrors(e.target.checked);
		},
		[setIgnoreCertificateErrors],
	);

	const onHeadless = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setHeadless(e.target.checked);
		},
		[setHeadless],
	);

	const onUserAgentChanged: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(e) => {
				setUserAgent(e.target.value);
			},
			[setUserAgent],
		);

	const onPlayBeepSound = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setBeep(e.target.checked);
		},
		[setBeep],
	);

	const openGlOptions = useMemo((): ComboboxValue[] => {
		return extendedOpenGlOptions.map((option) => {
			return {
				label: option === 'default' ? 'Default' : option,
				onClick: () => setOpenGlOption(option),
				key: option,
				leftItem: openGlOption === option ? <Checkmark /> : null,
				id: option,
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: option,
			};
		});
	}, [extendedOpenGlOptions, openGlOption, setOpenGlOption]);

	const x264PresetOptions = useMemo((): ComboboxValue[] => {
		return BrowserSafeApis.x264PresetOptions.map((option) => {
			return {
				label: labelx264Preset(option),
				onClick: () => setx264Preset(option),
				key: option,
				selected: x264Preset === option,
				type: 'item',
				id: option,
				keyHint: null,
				leftItem: null,
				quickSwitcherLabel: null,
				subMenu: null,
				value: option,
			};
		});
	}, [setx264Preset, x264Preset]);

	const changeOffthreadVideoCacheSizeInBytes: React.Dispatch<
		React.SetStateAction<number>
	> = useCallback(
		(cb) => {
			setOffthreadVideoCacheSizeInBytes((prev) => {
				if (prev === null) {
					throw new TypeError('Expected previous value');
				}

				if (typeof cb === 'function') {
					return cb(prev);
				}

				return cb;
			});
		},
		[setOffthreadVideoCacheSizeInBytes],
	);

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<div style={optionRow}>
				<div style={label}>Verbose logging</div>
				<div style={rightRow}>
					<Checkbox
						checked={logLevel === 'verbose'}
						onChange={onVerboseLoggingChanged}
						name="verbose-logging"
					/>
				</div>
			</div>
			{renderMode === 'still' ? null : (
				<NumberSetting
					min={minConcurrency}
					max={maxConcurrency}
					step={1}
					name="Concurrency"
					formatter={(w) => `${w}x`}
					onValueChanged={setConcurrency}
					value={concurrency}
				/>
			)}
			{renderMode === 'video' && codec === 'h264' ? (
				<div style={optionRow}>
					<div style={label}>x264 Preset</div>
					<div style={rightRow}>
						<Combobox
							title={x264Preset as string}
							selectedId={x264Preset as string}
							values={x264PresetOptions}
						/>
					</div>
				</div>
			) : null}

			<NumberSetting
				// Also appears in packages/renderer/src/validate-puppeteer-timeout.ts
				min={7_000}
				max={900_000}
				name="delayRender() timeout"
				onValueChanged={setDelayRenderTimeout}
				formatter={(w) => `${w}ms`}
				step={1000}
				value={delayRenderTimeout}
			/>
			<div style={optionRow}>
				<div style={label}>No parallel encoding</div>
				<div style={rightRow}>
					<Checkbox
						checked={disallowParallelEncoding}
						onChange={onDisallowParallelEncodingChanged}
						name="disallow-parallel-encoding"
					/>
				</div>
			</div>
			{renderMode === 'audio' ? null : (
				<div style={optionRow}>
					<div style={label}>Custom OffthreadVideo cache</div>
					<Spacing x={0.5} />
					<OptionExplainerBubble id="offthreadVideoCacheSizeInBytes" />
					<div style={rightRow}>
						<Checkbox
							checked={offthreadVideoCacheSizeInBytes !== null}
							onChange={toggleCustomOffthreadVideoCacheSizeInBytes}
							name="custom-audio-bitrate"
						/>
					</div>
				</div>
			)}
			{renderMode === 'audio' ||
			offthreadVideoCacheSizeInBytes === null ? null : (
				<NumberSetting
					min={minConcurrency}
					max={2000 * 1024 * 1024}
					step={1024}
					name="OffthreadVideo cache size"
					formatter={(w) => `${w} bytes`}
					onValueChanged={changeOffthreadVideoCacheSizeInBytes}
					value={offthreadVideoCacheSizeInBytes}
				/>
			)}
			<RenderModalHr />
			<div style={optionRow}>
				<div style={label}>Disable web security</div>
				<div style={rightRow}>
					<Checkbox
						checked={disableWebSecurity}
						onChange={onDisableWebSecurityChanged}
						name="disable-web-security"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Ignore certificate errors</div>
				<div style={rightRow}>
					<Checkbox
						checked={ignoreCertificateErrors}
						onChange={onIgnoreCertificatErrors}
						name="ignore-certificate-errors"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Headless mode</div>
				<div style={rightRow}>
					<Checkbox checked={headless} onChange={onHeadless} name="headless" />
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>
					OpenGL render backend <Spacing x={0.5} />
					<OptionExplainerBubble id="glOption" />
				</div>

				<div style={rightRow}>
					<Combobox
						values={openGlOptions}
						selectedId={openGlOption}
						title="OpenGl option"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Multi-process Chrome on Linux</div>
				<Spacing x={0.5} />
				<OptionExplainerBubble id="enableMultiprocessOnLinuxOption" />
				<div style={rightRow}>
					<Checkbox
						checked={enableMultiProcessOnLinux}
						onChange={onEnableMultiProcessOnLinux}
						name="enable-multi-process-on-linux"
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Custom User Agent</div>
				<div style={rightRow}>
					<Checkbox
						checked={userAgent !== null}
						onChange={toggleCustomUserAgent}
						name="custom-user-agent"
					/>
				</div>
			</div>
			{userAgent === null ? null : (
				<div style={optionRow}>
					<div style={label}>User Agent</div>
					<div style={rightRow}>
						<div>
							<RemotionInput
								style={input}
								value={userAgent}
								onChange={onUserAgentChanged}
								status="ok"
								rightAlign
							/>
						</div>
					</div>
				</div>
			)}
			<div style={optionRow}>
				<div style={label}>
					Beep when finished <OptionExplainerBubble id="beepOnFinishOption" />
				</div>

				<div style={rightRow}>
					<Checkbox
						checked={beep}
						onChange={onPlayBeepSound}
						name="beep-when-finished"
					/>
				</div>
			</div>
			<RenderModalHr />
			<RenderModalEnvironmentVariables
				envVariables={envVariables}
				setEnvVariables={setEnvVariables}
			/>
		</div>
	);
};
