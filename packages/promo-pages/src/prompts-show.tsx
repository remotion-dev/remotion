import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {PromptsShowPage} from './components/prompts/PromptsShow';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<PromptsShowPage />
		</div>
	</StrictMode>,
);
