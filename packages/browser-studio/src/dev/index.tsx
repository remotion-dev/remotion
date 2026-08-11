import {createRoot} from 'react-dom/client';
import {BrowserStudio} from '../BrowserStudio';
import {createBlankTemplateProject} from '../templates/blank';

const root = document.getElementById('root');

if (!root) {
	throw new Error('Could not find root element');
}

createRoot(root).render(
	<BrowserStudio
		iframeSrc="/frame.html"
		project={createBlankTemplateProject()}
		readOnly={false}
		workspacePackageBaseUrl={
			new URL('/__remotion_browser_studio_workspace__/', window.location.href)
				.href
		}
	/>,
);
