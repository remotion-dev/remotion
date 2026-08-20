import BrowserOnly from '@docusaurus/BrowserOnly';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
	BrowserStudio,
	createBlankTemplateProject,
} from '@remotion/browser-studio';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import React, {useEffect, useState} from 'react';

const page: React.CSSProperties = {
	backgroundColor: '#111111',
	height: '100dvh',
	inset: 0,
	overflow: 'hidden',
	position: 'fixed',
	width: '100vw',
};

const fallback: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	fontFamily: 'Arial, Helvetica, sans-serif',
	height: '100%',
	justifyContent: 'center',
	width: '100%',
};

const standaloneCss = `
	html,
	body,
	#__docusaurus {
		background: #111111;
		height: 100%;
		margin: 0;
		overflow: hidden;
		width: 100%;
	}

	.navbar,
	.footer,
	#crawlchat-script {
		display: none !important;
	}
`;

type InitialElementState =
	| {type: 'none'}
	| {type: 'invalid'}
	| {
			type: 'payload';
			payload: NonNullable<
				React.ComponentProps<typeof BrowserStudio>['initialElement']
			>;
	  };

const getInitialElementState = (): InitialElementState => {
	const hasPayload = new URLSearchParams(window.location.hash.slice(1)).has(
		'remotion-browser-studio',
	);
	if (!hasPayload) {
		return {type: 'none'};
	}

	const payload = StudioProtocolInternals.parseBrowserStudioHash(
		window.location.hash,
	);
	if (payload === null) {
		return {type: 'invalid'};
	}

	let sourceOrigin: string | null = null;
	try {
		sourceOrigin = document.referrer ? new URL(document.referrer).origin : null;
	} catch {
		sourceOrigin = null;
	}

	return {type: 'payload', payload: {payload, sourceOrigin}};
};

const BrowserStudioContent: React.FC<{
	readonly browserStudioWorkspaceCommit: string;
}> = ({browserStudioWorkspaceCommit}) => {
	const [initialElementState] = useState(getInitialElementState);
	const [project] = useState(createBlankTemplateProject);

	useEffect(() => {
		if (initialElementState.type === 'none') {
			return;
		}

		window.history.replaceState(
			null,
			'',
			`${window.location.pathname}${window.location.search}`,
		);
	}, [initialElementState.type]);

	if (initialElementState.type === 'invalid') {
		return <div style={fallback}>Invalid Browser Studio payload.</div>;
	}

	return (
		<BrowserStudio
			iframeSrc="/experimental_new/frame.html"
			initialElement={
				initialElementState.type === 'payload'
					? initialElementState.payload
					: null
			}
			project={project}
			readOnly={false}
			remotionPackageSource={{
				baseUrl: new URL(
					`/__remotion_browser_studio_workspace__/commits/${browserStudioWorkspaceCommit}/`,
					window.location.href,
				).href,
				commit: browserStudioWorkspaceCommit,
				type: 'workspace',
			}}
		/>
	);
};

const NewRemotionProject = () => {
	const {siteConfig} = useDocusaurusContext();
	const browserStudioWorkspaceCommit =
		siteConfig.customFields?.browserStudioWorkspaceCommit;
	if (typeof browserStudioWorkspaceCommit !== 'string') {
		throw new Error('Browser Studio workspace commit is not configured');
	}

	return (
		<>
			<Head>
				<title>New Remotion Project</title>
				<style>{standaloneCss}</style>
			</Head>
			<div style={page}>
				<BrowserOnly fallback={<div style={fallback}>Loading...</div>}>
					{() => (
						<BrowserStudioContent
							browserStudioWorkspaceCommit={browserStudioWorkspaceCommit}
						/>
					)}
				</BrowserOnly>
			</div>
		</>
	);
};

export default NewRemotionProject;
