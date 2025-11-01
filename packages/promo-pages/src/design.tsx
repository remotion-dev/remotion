import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ButtonDemo} from './components/3DEngine/ButtonDemo';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<ButtonDemo />
		</div>
	</StrictMode>,
);
