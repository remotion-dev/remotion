import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {TeamPage} from './components/team';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<TeamPage />
		</div>
	</StrictMode>,
);
