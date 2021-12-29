import ReactDOM from 'react-dom';
import {Overlay} from './Overlay';

export const mountRemotionOverlay = () => {
	ReactDOM.render(
		<Overlay />,
		document.getElementById('remotion-error-overlay')
	);
};
