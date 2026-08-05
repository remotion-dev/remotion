import {
	BrowserStudio,
	createBlankTemplateProject,
} from '@remotion/browser-studio';
import {createRoot} from 'react-dom/client';

const project = createBlankTemplateProject();
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
		project={project}
		readOnly={false}
		workspacePackageBaseUrl={
			new URL('/__remotion_browser_studio_workspace__/', window.location.href)
				.href
		}
	/>,
);
