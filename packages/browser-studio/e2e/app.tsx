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

createRoot(root).render(
	<BrowserStudio
		iframeSrc="/frame.html"
		initialElement={
			initialElementPayload === null
				? undefined
				: {payload: initialElementPayload, sourceOrigin: null}
		}
		project={project}
		readOnly={false}
		onProjectChange={(nextProject) => {
			(
				window as typeof window & {__browserStudioProject: VirtualProject}
			).__browserStudioProject = nextProject;
		}}
		workspacePackageBaseUrl={
			new URL('/__remotion_browser_studio_workspace__/', window.location.href)
				.href
		}
	/>,
);
