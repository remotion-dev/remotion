// In React 18, you should use createRoot() from "react-dom/client".
// In React 18, you should use render from "react-dom".

// We support both, but Webpack chooses both of them and normalizes them to "react-dom/client",
// hence why we import the right thing all the time but need to differentiate here

import ReactDOM from 'react-dom/client';
import {Overlay} from './Overlay';

export const mountRemotionOverlay = () => {
	if (ReactDOM.createRoot) {
		ReactDOM.createRoot(
			document.getElementById('remotion-error-overlay') as HTMLDivElement,
		).render(<Overlay />);
	} else {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(ReactDOM as unknown as {render: any}).render(
			<Overlay />,
			document.getElementById('remotion-error-overlay'),
		);
	}
};
