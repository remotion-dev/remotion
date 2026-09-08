import React, {Suspense, useCallback, useState} from 'react';
import {BLUE, LIGHT_TEXT, WARNING_COLOR, WHITE} from '../helpers/colors';
import {Button} from './Button';
import {sectionHeader} from './InspectorPanel/styles';
import {
	installOptionalPackage,
	useOptionalPackageInstalled,
} from './OptionalPackageModal';
import {WHISPER_WEBGPU_PACKAGE} from './Transcription/whisper-webgpu-capability';
import {VIDEO_MATTING_PACKAGE} from './VideoMatting/video-matting-capability';

const LazyWhisperModels = React.lazy(
	() => import('./Transcription/LazyModels'),
);

const LazyVideoMattingModels = React.lazy(
	() => import('./VideoMatting/LazyModels'),
);

const container: React.CSSProperties = {
	alignSelf: 'flex-start',
	boxSizing: 'border-box',
	fontFamily: 'sans-serif',
	minWidth: 0,
	padding: 16,
	width: '100%',
};

const overview: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	margin: '0 0 16px',
};

const section: React.CSSProperties = {
	paddingBottom: 16,
};

const lastSection: React.CSSProperties = {
	paddingTop: 16,
};

const title: React.CSSProperties = {
	...sectionHeader,
	margin: 0,
	padding: '4px 0 0',
};

const packageNameStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'monospace',
	fontSize: 12,
	lineHeight: 1.4,
	margin: 0,
};

const headingRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 12,
	justifyContent: 'space-between',
};

const missingText: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	margin: 0,
};

const missingDescription: React.CSSProperties = {
	...missingText,
	marginTop: 14,
};

const installButton: React.CSSProperties = {
	backgroundColor: BLUE,
	color: WHITE,
	flexShrink: 0,
};

const errorStyle: React.CSSProperties = {
	color: WARNING_COLOR,
	fontSize: 12,
	lineHeight: 1.4,
	margin: '8px 0 0',
};

type InstallState =
	| {type: 'idle'}
	| {type: 'installing'}
	| {type: 'error'; message: string};

const OptionalModelPackage: React.FC<{
	readonly children: React.ReactNode;
	readonly label: string;
	readonly packageName: string;
	readonly style: React.CSSProperties;
}> = ({children, label, packageName, style}) => {
	const installed = useOptionalPackageInstalled(packageName);
	const [installState, setInstallState] = useState<InstallState>({
		type: 'idle',
	});

	const install = useCallback(() => {
		setInstallState({type: 'installing'});
		installOptionalPackage(packageName).catch((error) => {
			setInstallState({
				type: 'error',
				message: error instanceof Error ? error.message : String(error),
			});
		});
	}, [packageName]);

	return (
		<section style={style}>
			<div style={headingRow}>
				<div>
					<h3 style={title}>{label}</h3>
					<p style={packageNameStyle}>{packageName}</p>
				</div>
				{installed ? null : (
					<Button
						disabled={installState.type === 'installing'}
						onClick={install}
						size="compact"
						style={installButton}
					>
						{installState.type === 'installing' ? 'Installing…' : 'Install'}
					</Button>
				)}
			</div>
			{installed ? (
				<Suspense fallback={<p style={missingText}>Loading models…</p>}>
					{children}
				</Suspense>
			) : (
				<>
					<p style={missingDescription}>
						Install the package to download and manage its models.
					</p>
					{installState.type === 'error' ? (
						<p style={errorStyle}>{installState.message}</p>
					) : null}
				</>
			)}
		</section>
	);
};

export const ModelsSettings: React.FC = () => {
	return (
		<div style={container}>
			<p style={overview}>
				Models are downloaded automatically when needed. You can also manage the
				browser cache here.
			</p>
			<OptionalModelPackage
				label="Transcription"
				packageName={WHISPER_WEBGPU_PACKAGE}
				style={section}
			>
				<LazyWhisperModels
					description="Select an audio or video asset to transcribe it."
					indent={false}
					visible
				/>
			</OptionalModelPackage>
			<OptionalModelPackage
				label="Video matting"
				packageName={VIDEO_MATTING_PACKAGE}
				style={lastSection}
			>
				<LazyVideoMattingModels
					description="Select a video asset to separate background and foreground."
					indent={false}
					visible
				/>
			</OptionalModelPackage>
		</div>
	);
};
