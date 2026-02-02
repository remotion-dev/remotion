import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {PromptsSubmitPage} from './components/prompts/PromptsSubmit';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<PromptsSubmitPage />
		</div>
	</StrictMode>,
);
