import {
	BrowserStudio,
	createBlankTemplateProject,
	loadGitHubRepository,
	type VirtualProject,
} from '@remotion/browser-studio';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {createRoot} from 'react-dom/client';
import {VERSION} from 'remotion/version';

const initialElementPayload = StudioProtocolInternals.parseBrowserStudioHash(
	window.location.hash,
);
(
	window as typeof window & {__browserStudioRemotionVersion: string}
).__browserStudioRemotionVersion = VERSION;
const render = async () => {
	const project = new URLSearchParams(window.location.search).has('github')
		? await loadGitHubRepository({
				repoUrl: 'https://github.com/remotion-dev/opfs-fixture',
			})
		: createBlankTemplateProject();
	(
		window as typeof window & {
			__browserStudioProject: VirtualProject;
			__browserStudioRemotionVersion: string;
		}
	).__browserStudioProject = project;
	if (!new URLSearchParams(window.location.search).has('github')) {
		project.files['/project/src/index.ts'] =
			`import {fade} from '@remotion/transitions/fade';
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

void fade;
registerRoot(RemotionRoot);
`;
	}

	const root = document.getElementById('root');
	if (!root) {
		throw new Error('Could not find root element');
	}

	createRoot(root).render(
		<BrowserStudio
			iframeSrc="/frame.html"
			initialElement={
				initialElementPayload === null
					? null
					: {payload: initialElementPayload, sourceOrigin: null}
			}
			project={project}
			readOnly={false}
			onProjectChange={(nextProject) => {
				(
					window as typeof window & {__browserStudioProject: VirtualProject}
				).__browserStudioProject = nextProject;
			}}
			remotionPackageSource={
				new URLSearchParams(window.location.search).get('source') === 'release'
					? {
							baseUrl: new URL(
								`/__remotion_browser_studio_release__/${VERSION}/`,
								window.location.href,
							).href,
							type: 'release',
							version: VERSION,
						}
					: {
							baseUrl: new URL(
								'/__remotion_browser_studio_workspace__/commits/e2e/',
								window.location.href,
							).href,
							commit: 'e2e',
							type: 'workspace',
						}
			}
		/>,
	);
};

render().catch((error) => {
	setTimeout(() => {
		throw error;
	}, 0);
});
