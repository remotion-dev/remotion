import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AutomatePage} from './components/Automate';
import type {ColorMode} from './components/homepage/layout/use-color-mode';
import './index.css';

const App: React.FC = () => {
	const [colorMode, setColorMode] = useState<ColorMode>('light');

	return (
		<div data-theme={colorMode} className="bg-[var(--background)]">
			<AutomatePage colorMode={colorMode} setColorMode={setColorMode} />
		</div>
	);
};

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
