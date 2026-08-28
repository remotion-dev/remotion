import type {
	GetReleaseNotesResponse,
	UpdateAvailableResponse,
} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	BACKGROUND,
	BORDER_WHITE_ALPHA_12,
	BLUE,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
	WHITE,
} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {ClipboardIcon} from '../icons/clipboard';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {KnownBugs} from './KnownBugs';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {showNotification} from './Notifications/NotificationCenter';
import {getReleaseNotes} from './RenderQueue/actions';
import {useSettings} from './SettingsContext';
import {useUpdateStatus} from './UpdateStatusContext';

const container: React.CSSProperties = {
	alignSelf: 'flex-start',
	boxSizing: 'border-box',
	flex: 1,
	minWidth: 0,
	padding: '4px 16px 0',
};

const text: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const title: React.CSSProperties = {
	paddingTop: 12,
	paddingBottom: 8,
	...text,
};

const titleBeforeCommand: React.CSSProperties = {
	...title,
	paddingBottom: 0,
};

const commandField: React.CSSProperties = {
	alignItems: 'center',
	background: SELECTED_BACKGROUND,
	borderRadius: 6,
	boxSizing: 'border-box',
	display: 'flex',
	marginBottom: 10,
	marginTop: 10,
	padding: '8px 8px 8px 10px',
	width: '100%',
};

const code: React.CSSProperties = {
	color: WHITE,
	flex: 1,
	fontFamily: 'monospace',
	fontSize: 14,
	lineHeight: 1.5,
	margin: 0,
	minWidth: 0,
	overflowX: 'auto',
	whiteSpace: 'pre',
};

const copyIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 12,
	width: 12,
};

const link: React.CSSProperties = {
	...text,
	fontWeight: 'bold',
	color: BLUE,
	textDecoration: 'none',
};

const releaseNotesFrame: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	border: 0,
	display: 'block',
	marginTop: 8,
	overflow: 'hidden',
	width: '100%',
};

const releaseNotesTitle: React.CSSProperties = {
	...title,
	borderBottom: BORDER_WHITE_ALPHA_12,
	width: '100%',
};

const commands: {
	[key in UpdateAvailableResponse['packageManager']]: string;
} = {
	npm: 'npx remotion upgrade',
	yarn: 'yarn remotion upgrade',
	pnpm: 'pnpm exec remotion upgrade',
	bun: 'bun remotion upgrade',
	unknown: 'npx remotion upgrade',
};

const skillsUpdateCommand = 'npx remotion skills update';
const remotionUpgradeSkill = '/remotion-upgrade';

const formatReleaseDate = (publishedAt: string | null) => {
	if (publishedAt === null) {
		return null;
	}

	const date = new Date(publishedAt);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	const day = date.getDate();
	const lastTwoDigits = day % 100;
	const suffix =
		lastTwoDigits >= 11 && lastTwoDigits <= 13
			? 'th'
			: day % 10 === 1
				? 'st'
				: day % 10 === 2
					? 'nd'
					: day % 10 === 3
						? 'rd'
						: 'th';
	const month = new Intl.DateTimeFormat('en-US', {
		month: 'long',
	}).format(date);

	return `${month} ${day}${suffix}, ${date.getFullYear()}`;
};

const RenderedReleaseNotes: React.FC<{
	readonly release: GetReleaseNotesResponse['releases'][number];
}> = ({release}) => {
	const [height, setHeight] = useState(220);
	const frameRef = useRef<HTMLIFrameElement>(null);
	const resizeObserver = useRef<ResizeObserver | null>(null);
	const formattedReleaseDate = formatReleaseDate(release.publishedAt);
	const document = useMemo(() => {
		if (release.releaseNotesHtml === null) {
			return null;
		}

		return `<!doctype html><html><head><base href="https://github.com/remotion-dev/remotion/" target="_blank"><style>
			:root { color-scheme: dark; }
			html, body { overflow: hidden; }
			body { background: ${BACKGROUND}; color: ${LIGHT_TEXT}; font-family: sans-serif; font-size: 13px; line-height: 1.5; margin: 0; overflow-wrap: anywhere; }
			h1, h2, h3, h4, h5, h6 { color: ${WHITE}; line-height: 1.25; margin: 16px 0 8px; }
			h1:first-child, h2:first-child, h3:first-child { margin-top: 0; }
			h1 { font-size: 18px; } h2 { font-size: 16px; } h3, h4, h5, h6 { font-size: 14px; }
			p, ul, ol, pre, blockquote { margin: 8px 0; }
			ul, ol { padding-left: 22px; }
			a { color: ${BLUE}; text-decoration: none; }
			code { background: transparent; color: ${LIGHT_TEXT}; font-family: monospace; padding: 0; }
			pre { background: ${SELECTED_BACKGROUND}; border-radius: 6px; overflow-x: auto; padding: 10px; }
			pre code { background: transparent; padding: 0; }
			img { max-width: 100%; }
			blockquote { border-left: 3px solid ${SELECTED_BACKGROUND}; margin-left: 0; padding-left: 10px; }
			hr { border: 0; border-top: 1px solid ${SELECTED_BACKGROUND}; }
		</style></head><body>${release.releaseNotesHtml}</body></html>`;
	}, [release.releaseNotesHtml]);

	useEffect(() => {
		return () => resizeObserver.current?.disconnect();
	}, []);

	const onLoad = useCallback(() => {
		resizeObserver.current?.disconnect();
		const iframeDocument = frameRef.current?.contentDocument;
		if (!iframeDocument?.body) {
			return;
		}

		const updateHeight = () => {
			setHeight(iframeDocument.documentElement.scrollHeight + 2);
		};

		updateHeight();
		const observer = new ResizeObserver(updateHeight);
		observer.observe(iframeDocument.body);
		resizeObserver.current = observer;
	}, []);

	return (
		<>
			<div style={releaseNotesTitle}>
				{release.version}
				{formattedReleaseDate === null
					? null
					: ` \u2013\u00a0${formattedReleaseDate}`}
			</div>
			{document === null ? (
				<div style={text}>
					Release notes could not be loaded.{' '}
					<a
						style={link}
						target="_blank"
						href={`https://github.com/remotion-dev/remotion/releases/tag/v${release.version}`}
					>
						View them on GitHub
					</a>
					.
				</div>
			) : (
				<iframe
					ref={frameRef}
					onLoad={onLoad}
					sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
					scrolling="no"
					srcDoc={document}
					style={{...releaseNotesFrame, height}}
					title={`Release notes for Remotion ${release.version}`}
				/>
			)}
		</>
	);
};

export const UpdatesSettings: React.FC = () => {
	const {remotionSkillsInfo} = useSettings();
	const {error, info, knownBugs} = useUpdateStatus();
	const [releaseNotes, setReleaseNotes] = useState<
		| (GetReleaseNotesResponse & {
				currentVersion: string;
				latestVersion: string;
		  })
		| null
	>(null);

	useEffect(() => {
		if (!info?.updateAvailable) {
			return;
		}

		const controller = new AbortController();
		getReleaseNotes(info.currentVersion, info.latestVersion, controller.signal)
			.then((response) => {
				setReleaseNotes({
					...response,
					currentVersion: info.currentVersion,
					latestVersion: info.latestVersion,
				});
			})
			.catch(() => {
				if (!controller.signal.aborted) {
					setReleaseNotes({
						currentVersion: info.currentVersion,
						hasMore: false,
						latestVersion: info.latestVersion,
						releases: [],
					});
				}
			});

		return () => controller.abort();
	}, [info]);

	const hasKnownBugs = useMemo(() => {
		return (knownBugs?.length ?? 0) > 0;
	}, [knownBugs]);

	const updateAction = info
		? remotionSkillsInfo?.remotionUpgradeSkillAvailable
			? remotionUpgradeSkill
			: info.updateAvailable
				? commands[info.packageManager]
				: skillsUpdateCommand
		: null;
	const updateActionType = remotionSkillsInfo?.remotionUpgradeSkillAvailable
		? 'skill'
		: 'command';

	const onClick = useCallback(() => {
		if (updateAction === null) {
			return;
		}

		copyText(updateAction).catch((err) => {
			showNotification('Could not copy: ' + err.message, 2000);
		});
	}, [updateAction]);

	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon color={color} style={copyIcon} />;
	}, []);

	if (info === null) {
		return (
			<div style={container}>
				{error ? (
					<div style={{paddingTop: 12}}>
						<ValidationMessage
							message={'Could not check for updates: ' + error}
							align="flex-start"
							type="error"
						/>
					</div>
				) : (
					<div style={title}>Checking for updates...</div>
				)}
			</div>
		);
	}

	if (info.timedOut && !info.skillsUpdateAvailable) {
		return (
			<div style={container}>
				<div style={title}>Could not check for updates.</div>
				<div style={text}>The update check timed out. Try again later.</div>
			</div>
		);
	}

	if (!info.updateAvailable && !info.skillsUpdateAvailable) {
		return (
			<div style={container}>
				<div style={title}>You{"'re"} up to date.</div>
				<div style={text}>
					Remotion {info.currentVersion} and your Remotion Agent Skills are up
					to date.
				</div>
			</div>
		);
	}

	return (
		<div style={container}>
			{hasKnownBugs && info.updateAvailable ? (
				<>
					<div style={title}>
						The currently installed version {info.currentVersion} has the
						following known bugs:
					</div>
					<KnownBugs bugs={knownBugs ?? []} />
					<div style={{height: '20px'}} />
					<div style={text}>
						To update, run the following {updateActionType}:
					</div>
				</>
			) : info.updateAvailable ? (
				<div style={titleBeforeCommand}>
					A new Remotion update is available. Run the following{' '}
					{updateActionType}:
				</div>
			) : (
				<div style={titleBeforeCommand}>
					Your Remotion Agent Skills are out of date. Run the following{' '}
					{updateActionType}:
				</div>
			)}
			<div style={commandField}>
				<pre style={code}>{updateAction}</pre>
				<InlineAction
					variant={null}
					onClick={onClick}
					renderAction={renderCopyAction}
					title="Copy command"
				/>
			</div>
			{info.updateAvailable ? (
				<div style={text}>
					This will update Remotion from {info.currentVersion} to{' '}
					{info.latestVersion}
					{info.skillsUpdateAvailable
						? ' and update your project Remotion Agent Skills.'
						: '.'}
				</div>
			) : null}
			{info.updateAvailable ? (
				releaseNotes?.currentVersion === info.currentVersion &&
				releaseNotes.latestVersion === info.latestVersion ? (
					releaseNotes.releases.length === 0 ? (
						<>
							<div style={releaseNotesTitle}>{info.latestVersion}</div>
							<div style={text}>
								Release notes could not be loaded.{' '}
								<a
									style={link}
									target="_blank"
									href="https://github.com/remotion-dev/remotion/releases"
								>
									View them on GitHub
								</a>
								.
							</div>
						</>
					) : (
						<>
							{releaseNotes.releases.map((release) => (
								<RenderedReleaseNotes key={release.version} release={release} />
							))}
							{releaseNotes.hasMore ? (
								<div style={{...text, paddingTop: 12}}>
									Showing the 5 most recent releases.{' '}
									<a
										style={link}
										target="_blank"
										href="https://github.com/remotion-dev/remotion/releases"
									>
										View all releases on GitHub
									</a>
									.
								</div>
							) : null}
						</>
					)
				) : (
					<div style={text}>Loading release notes...</div>
				)
			) : null}
		</div>
	);
};
