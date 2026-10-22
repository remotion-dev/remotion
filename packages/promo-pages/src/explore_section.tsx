import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ExploreSection} from './components/ExploreSection';
import './index.css';

const colorMode =
	new URLSearchParams(window.location.search).get('theme') === 'dark'
		? 'dark'
		: 'light';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme={colorMode} className="min-h-screen bg-[var(--background)]">
			<ExploreSection />
		</div>
	</StrictMode>,
);
