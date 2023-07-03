import type {ChangeEvent} from 'react';
import React, {useCallback, useMemo} from 'react';

import type {UiOpenGlOptions} from '../../../required-chromium-options';
import {Checkmark} from '../../icons/Checkmark';
import {Checkbox} from '../Checkbox';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';
import {RenderModalEnvironmentVariables} from './RenderModalEnvironmentVariables';
import {RenderModalHr} from './RenderModalHr';

export type RenderType = 'still' | 'video' | 'audio';

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
	setVerboseLogging: React.Dispatch<React.SetStateAction<boolean>>;
	verbose: boolean;
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
}> = ({
	renderMode,
	maxConcurrency,
	minConcurrency,
	setConcurrency,
	concurrency,
	setVerboseLogging,
	verbose,
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
}) => {
	const extendedOpenGlOptions: UiOpenGlOptions[] = useMemo(() => {
		return ['angle', 'egl', 'swangle', 'swiftshader', 'default'];
	}, []);
	const onVerboseLoggingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setVerboseLogging(e.target.checked);
		},
		[setVerboseLogging]
	);

	const onDisallowParallelEncodingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setDisallowParallelEncoding(e.target.checked);
		},
		[setDisallowParallelEncoding]
	);

	const onDisableWebSecurityChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setDisableWebSecurity(e.target.checked);
		},
		[setDisableWebSecurity]
	);

	const onIgnoreCertificatErrors = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setIgnoreCertificateErrors(e.target.checked);
		},
		[setIgnoreCertificateErrors]
	);

	const onHeadless = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setHeadless(e.target.checked);
		},
		[setHeadless]
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

	return (
		<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
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
			<div style={optionRow}>
				<div style={label}>Verbose logging</div>
				<div style={rightRow}>
					<Checkbox
						checked={verbose}
						onChange={onVerboseLoggingChanged}
						name="verbose-logging"
					/>
				</div>
			</div>
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
				<div style={label}>Ignore certificate errors </div>
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
				<div style={label}>OpenGL render backend</div>

				<div style={rightRow}>
					<Combobox
						values={openGlOptions}
						selectedId={openGlOption}
						title="OpenGl option"
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
