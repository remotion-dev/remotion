import type {ChangeEvent} from 'react';
import React, {useCallback} from 'react';

import {Checkbox} from '../Checkbox';
import {label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';
import {RenderModalHr} from './RenderModalHr';

export type RenderType = 'still' | 'video' | 'audio';

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
	setDisableHeadless: React.Dispatch<React.SetStateAction<boolean>>;
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
	setDisableHeadless,
}) => {
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

	const onDisableHeadless = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setDisableHeadless(e.target.checked);
		},
		[setDisableHeadless]
	);
	return (
		<div>
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
					/>
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Verbose logging</div>
				<div style={rightRow}>
					<Checkbox checked={verbose} onChange={onVerboseLoggingChanged} />
				</div>
			</div>
			<RenderModalHr />
			<div style={optionRow}>
				<div style={label}>Disable web security</div>
				<div style={rightRow}>
					<Checkbox checked={verbose} onChange={onDisableWebSecurityChanged} />
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Ignore certificat errors </div>
				<div style={rightRow}>
					<Checkbox checked={verbose} onChange={onIgnoreCertificatErrors} />
				</div>
			</div>
			<div style={optionRow}>
				<div style={label}>Disable headless</div>
				<div style={rightRow}>
					<Checkbox checked={verbose} onChange={onDisableHeadless} />
				</div>
			</div>
		</div>
	);
};
