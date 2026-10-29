import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {NewLanding} from './components/Homepage';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<NewLanding colorMode="light" setColorMode={() => {}} />
		</div>
	</StrictMode>,
);
