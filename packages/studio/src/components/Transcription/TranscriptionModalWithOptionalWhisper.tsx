import React, {Suspense} from 'react';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import type {TranscriptionModalState} from '../../state/modals';
import {OptionalPackageModal} from '../OptionalPackageModal';
import {WHISPER_WEBGPU_PACKAGE} from './whisper-webgpu-capability';

const codeStyle: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'monospace',
	fontSize: 14,
	lineHeight: 1.5,
};

const detailsStyle: React.CSSProperties = {
	marginTop: 12,
};

const summaryStyle: React.CSSProperties = {
	cursor: 'default',
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: 1.5,
};

const listStyle: React.CSSProperties = {
	listStyle: 'none',
	margin: '8px 0 0',
	padding: 0,
};

const rowStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	gap: 12,
	padding: '2px 0',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.5,
};

const modelTextStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'monospace',
	fontSize: 13,
	lineHeight: 1.5,
};

const sizeTextStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.5,
};

// Keep these approximate sizes in sync with packages/whisper-webgpu/src/models.ts.
const modelSizes = [
	{model: 'tiny', size: '~120 MB'},
	{model: 'base', size: '~206 MB'},
	{model: 'small', size: '~586 MB'},
	{model: 'medium', size: '~1.7 GB'},
	{model: 'large-v3-turbo', size: '~1.6 GB'},
];

const INSTALL_MESSAGE = (
	<>
		Generate captions on-device with{' '}
		<code style={codeStyle}>@remotion/whisper-webgpu</code> and{' '}
		<code style={codeStyle}>Transformers.js</code>. Multilingual models support
		99 languages. Models require a separate download before first use.
		<details style={detailsStyle}>
			<summary
				className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
				style={summaryStyle}
			>
				Model options and download sizes
			</summary>
			<ul style={listStyle}>
				{modelSizes.map(({model, size}) => (
					<li key={model} style={rowStyle}>
						<span style={modelTextStyle}>{model}</span>
						<span style={sizeTextStyle}>{size}</span>
					</li>
				))}
			</ul>
		</details>
	</>
);

const LazyTranscriptionModal = React.lazy(async () => {
	const {TranscriptionModal} = await import('./TranscriptionModal');
	return {default: TranscriptionModal};
});

export const TranscriptionModalWithOptionalWhisper: React.FC<{
	readonly state: TranscriptionModalState;
}> = ({state}) => {
	return (
		<OptionalPackageModal
			ariaLabel="Install transcription package"
			installButtonText="Install packages"
			installMessage={INSTALL_MESSAGE}
			packageName={WHISPER_WEBGPU_PACKAGE}
			title={state.target === null ? 'Transcribe' : 'Generate captions'}
		>
			<Suspense fallback={null}>
				<LazyTranscriptionModal {...state} />
			</Suspense>
		</OptionalPackageModal>
	);
};
