import {
	BrowserStudio,
	createBlankTemplateProject,
} from '@remotion/browser-studio';
import {createRoot} from 'react-dom/client';

const root = document.getElementById('root');
if (!root) {
	throw new Error('Could not find root element');
}

createRoot(root).render(
	<BrowserStudio
		iframeSrc="/frame.html"
		project={createBlankTemplateProject()}
		readOnly={false}
	/>,
);
