import {
	BrowserStudio,
	createBlankTemplateProject,
	type VirtualProject,
} from '@remotion/browser-studio';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {createRoot} from 'react-dom/client';
import {VERSION} from 'remotion/version';

const project = createBlankTemplateProject();
const initialElementPayload = StudioProtocolInternals.parseBrowserStudioHash(
	window.location.hash,
);
(
	window as typeof window & {
		__browserStudioProject: VirtualProject;
		__browserStudioRemotionVersion: string;
	}
).__browserStudioProject = project;
(
	window as typeof window & {__browserStudioRemotionVersion: string}
).__browserStudioRemotionVersion = VERSION;
project.files['/project/src/index.ts'] =
	`import {fade} from '@remotion/transitions/fade';
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

void fade;
registerRoot(RemotionRoot);
`;

const root = document.getElementById('root');
if (!root) {
	throw new Error('Could not find root element');
}

const source = new URLSearchParams(window.location.search).get('source');

createRoot(root).render(
	<BrowserStudio
		dependencyResolver={
			source === 'fallback'
				? ({name, version}) => (name === 'react' ? version : null)
				: undefined
		}
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
			source === 'release'
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
