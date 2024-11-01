import type {Template} from 'create-video';
import React, {useCallback, useMemo, useState} from 'react';
import {useMobileLayout} from '../helpers/mobile-layout';
import {BackButton} from './BackButton';
import {CommandCopyButton} from './CommandCopyButton';
import {MuxVideo} from './MuxVideo';
import {Spinner} from './Spinner';
import {Tailwind} from './icons/tailwind';

const RESERVED_FOR_SIDEBAR = 550;

const column: React.CSSProperties = {
	width: RESERVED_FOR_SIDEBAR,
	overflow: 'auto',
};

const iconContainer: React.CSSProperties = {
	width: 24,
	height: 36,
	marginRight: 12,
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
};

const link: React.CSSProperties = {
	color: 'inherit',
	display: 'inline-flex',
	flexDirection: 'row',
	alignItems: 'center',
	cursor: 'pointer',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const description: React.CSSProperties = {};

const githubrow: React.CSSProperties = {
	flexDirection: 'row',
	alignItems: 'center',
	display: 'flex',
	paddingTop: 4,
	paddingBottom: 4,
	verticalAlign: 'middle',
	paddingRight: 16,
};

const loadingContainer: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	display: 'flex',
};

const installCommand: React.CSSProperties = {
	marginRight: 12,
};

const GithubIcon: React.FC = () => {
	return (
		<svg viewBox="0 0 496 512" height="22" width="22">
			<path
				fill="currentColor"
				d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
			/>
		</svg>
	);
};

const StackBlitzIcon: React.FC = () => {
	return (
		<svg viewBox="0 0 28 28" aria-hidden="true" width="24" height="24">
			<path
				fill="currentColor"
				d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.671-10.227z"
			/>
		</svg>
	);
};

const PreviewIcon: React.FC = () => {
	return (
		<svg viewBox="0 0 512 512" aria-hidden="true" width="24" height="24">
			<path
				fill="currentColor"
				d="M368 208A160 160 0 1 0 48 208a160 160 0 1 0 320 0zM337.1 371.1C301.7 399.2 256.8 416 208 416C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208c0 48.8-16.8 93.7-44.9 129.1l124 124 17 17L478.1 512l-17-17-124-124zM145.8 116.2l24 14 110.2 64L303.9 208 280 221.8l-110.2 64-24 14V272 144 116.2z"
			/>
		</svg>
	);
};

const spinner: React.CSSProperties = {
	height: 16,
	width: 16,
};

const separator: React.CSSProperties = {
	height: 24,
	backgroundColor: 'var(--light-text-color)',
	opacity: 0.2,
	borderRadius: 1,
	width: 1,
	marginLeft: 10,
	marginRight: 10,
};

let copyTimeout: Timer | null = null;

export const TemplateModalContent: React.FC<{
	readonly template: Template;
}> = ({template}) => {
	const [copied, setCopied] = useState<string | false>(false);
	const [showPkgManagers, setShowPackageManagers] = useState(false);
	const [loaded, setLoaded] = useState(false);

	const mobileLayout = useMobileLayout();

	const containerCss: React.CSSProperties = useMemo(() => {
		return {
			marginBottom: 0,
			display: 'flex',
			flexDirection: mobileLayout ? 'column' : 'row',
			overflow: 'auto',
			height: mobileLayout ? '100%' : undefined,
			left: mobileLayout ? 0 : undefined,
			top: mobileLayout ? 0 : undefined,
		};
	}, [mobileLayout]);

	const loadingStyle = useMemo(() => {
		return {
			...loadingContainer,
			width: '100%',
			border: '1px solid var(--ifm-color-emphasis-300)',
			borderRadius: 5,
			aspectRatio:
				template.type === 'video'
					? `${template.promoVideo.width} / ${template.promoVideo.height}`
					: '',
		};
	}, [template]);

	const onLoadedMetadata = useCallback(() => {
		setLoaded(true);
	}, []);

	const copyCommand = useCallback(async (command: string) => {
		clearTimeout(copyTimeout!);
		const permissionName = 'clipboard-write' as PermissionName;
		try {
			const result = await navigator.permissions.query({
				name: permissionName,
			});
			if (result.state === 'granted' || result.state === 'prompt') {
				await navigator.clipboard.writeText(command);
				setCopied(command);
			}
		} catch (err) {
			// eslint-disable-next-line no-alert
			alert('Copying is not supported on this device');
			console.log('Could not copy command', err);
		}

		copyTimeout = setTimeout(() => {
			setCopied(false);
		}, 2000);
	}, []);

	const togglePkgManagers = useCallback(() => {
		setShowPackageManagers((s) => !s);
	}, []);

	const npmCommand = `npx create-video@latest --${template.cliId}`;
	const yarnCommand = `yarn create video --${template.cliId}`;
	const pnpmCommand = `pnpm create video --${template.cliId}`;
	const bunCommand = `bun create video --${template.cliId}`;

	return (
		<div>
			<BackButton
				link="/templates"
				text="Back to Templates"
				color="currentcolor"
			/>
			<br />
			<br />
			<div style={containerCss}>
				<div
					style={{
						display: 'flex',
						width: '100%',
						aspectRatio:
							template.type === 'video'
								? `${template.promoVideo.width} / ${template.promoVideo.height}`
								: undefined,
					}}
				>
					{loaded || template.type === 'image' ? null : (
						<div style={loadingStyle}>
							<Spinner
								style={{
									...spinner,
								}}
							/>
						</div>
					)}
					{template.type === 'video' ? (
						<MuxVideo
							muxId={template.promoVideo.muxId}
							loop
							autoPlay
							muted
							playsInline
							style={{
								aspectRatio: `${template.promoVideo.width} / ${template.promoVideo.height}`,
								width: '100%',
								height: 'auto',
								opacity: Number(loaded),
								display: loaded ? 'inline-flex' : 'none',
								borderRadius: 5,
								border: '1px solid var(--ifm-color-emphasis-300)',
							}}
							onLoadedMetadata={onLoadedMetadata}
						/>
					) : (
						<img
							src={template.promoBanner.src}
							style={{
								borderRadius: 5,
								width: '100%',
								height: 'auto',
								border: '1px solid var(--ifm-color-emphasis-300)',
							}}
							onLoad={onLoadedMetadata}
						/>
					)}
				</div>
				<div
					style={{
						...column,
						marginLeft: mobileLayout ? 0 : 20,
						marginTop: mobileLayout ? 20 : 0,
						width: mobileLayout ? '100%' : RESERVED_FOR_SIDEBAR,
					}}
				>
					<div style={githubrow}>
						<a style={link} onPointerDown={() => copyCommand(npmCommand)}>
							<div style={iconContainer}>
								<CommandCopyButton copied={copied === npmCommand} />
							</div>
							<div style={installCommand}>{npmCommand}</div>
						</a>
						<div style={{width: 2}} />
						{showPkgManagers ? null : (
							<a style={link} onPointerDown={togglePkgManagers}>
								<span
									style={{
										whiteSpace: 'pre',
										color: 'var(--light-text-color)',
									}}
								>
									More
								</span>{' '}
							</a>
						)}
						<div
							style={{
								width: 8,
							}}
						/>
					</div>
					{showPkgManagers ? (
						<div style={githubrow}>
							<a
								target={'_blank'}
								style={link}
								onPointerDown={() => copyCommand(bunCommand)}
							>
								<div style={iconContainer}>
									<CommandCopyButton copied={copied === bunCommand} />
								</div>
								<div style={installCommand}>{bunCommand}</div>
							</a>
						</div>
					) : null}
					{showPkgManagers ? (
						<div style={githubrow}>
							<a style={link} onPointerDown={() => copyCommand(pnpmCommand)}>
								<div style={iconContainer}>
									<CommandCopyButton copied={copied === pnpmCommand} />
								</div>
								<div style={installCommand}>{pnpmCommand}</div>
							</a>
						</div>
					) : null}
					{showPkgManagers ? (
						<div style={githubrow}>
							<a
								target={'_blank'}
								style={link}
								onPointerDown={() => copyCommand(yarnCommand)}
							>
								<div style={iconContainer}>
									<CommandCopyButton copied={copied === yarnCommand} />
								</div>
								<div style={installCommand}>{yarnCommand}</div>
							</a>
						</div>
					) : null}

					<div style={githubrow}>
						<a
							target={'_blank'}
							style={link}
							href={`https://github.com/${template.org}/${template.repoName}/generate`}
						>
							<div style={iconContainer}>
								<GithubIcon />
							</div>{' '}
							Use template
						</a>
						<div style={separator} />
						<a
							target={'_blank'}
							style={link}
							href={`https://github.com/${template.org}/${template.repoName}`}
						>
							View source
						</a>
					</div>
					{template.previewURL && (
						<a target={'_blank'} style={link} href={template.previewURL}>
							<div style={githubrow}>
								<div style={iconContainer}>
									<PreviewIcon />
								</div>
								See Preview{' '}
								<span
									style={{
										whiteSpace: 'pre',
										color: 'var(--light-text-color)',
									}}
								>
									{' '}
									via Remotion Studio
								</span>
							</div>
						</a>
					)}
					<a
						target={'_blank'}
						style={link}
						href={`https://stackblitz.com/github/${template.org}/${template.repoName}`}
					>
						<div style={githubrow}>
							<div style={iconContainer}>
								<StackBlitzIcon />
							</div>
							Try online{' '}
							<span
								style={{whiteSpace: 'pre', color: 'var(--light-text-color)'}}
							>
								{' '}
								via StackBlitz
							</span>
						</div>
					</a>
					{template.allowEnableTailwind ? (
						<div style={githubrow}>
							<div style={iconContainer}>
								<Tailwind />
							</div>
							Supports Tailwind
						</div>
					) : null}
				</div>
			</div>{' '}
			<br />
			<br />
			<h1
				style={{
					marginTop: 0,
				}}
			>
				{template.shortName}
			</h1>
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{
					__html: template.longerDescription,
				}}
				style={description}
			/>
			<br />
			<br />
		</div>
	);
};
