import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {PromptsGalleryPage} from './components/prompts/PromptsGallery';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<PromptsGalleryPage />
		</div>
	</StrictMode>,
);
