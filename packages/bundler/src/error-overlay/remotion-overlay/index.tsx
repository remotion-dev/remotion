// In React 18, you should use createRoot() from "react-dom/client".
// In React 18, you should use render from "react-dom".

// We support both, but Webpack chooses both of them and normalizes them to "react-dom/client",
// hence why we import the right thing all the time but need to differentiate here

import type {render} from 'react-dom';
import ReactDOM from 'react-dom/client';
import {Overlay} from './Overlay';

export const mountRemotionOverlay = () => {
	if (ReactDOM.createRoot) {
		ReactDOM.createRoot(
			document.getElementById('remotion-error-overlay') as HTMLDivElement
		).render(<Overlay />);
	} else {
		(ReactDOM as unknown as {render: typeof render}).render(
			<Overlay />,
			document.getElementById('remotion-error-overlay')
		);
	}
};
