import ReactRefreshRuntime from 'react-refresh/runtime';
import type {CreateBrowserBundlerPreview} from './bridge';

ReactRefreshRuntime.injectIntoGlobalHook(globalThis);

// React DOM must be evaluated after the development Refresh hook is installed.
const initialize: Promise<CreateBrowserBundlerPreview> =
	import('./runtime').then(
		({createBrowserBundlerPreview}) => createBrowserBundlerPreview,
	);

window.remotionBrowserBundlerPreview = initialize;

void initialize.catch((error: unknown) => {
	const message = document.createElement('p');
	message.setAttribute('role', 'alert');
	message.textContent = `Could not load the Player preview: ${
		error instanceof Error ? error.message : String(error)
	}`;
	document.body.replaceChildren(message);
});
