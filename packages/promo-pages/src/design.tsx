import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ButtonDemo} from './components/3DEngine/ButtonDemo';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<div className="flex absolute h-full w-full bg-[#F9FAFC] pt-[100px]">
				<div className="w-[800px] mx-auto">
					<ButtonDemo>Choose a template</ButtonDemo>
					<ButtonDemo className="w-full">Choose a template</ButtonDemo>
					<ButtonDemo className="w-full rounded-full">Fully rounded</ButtonDemo>
					<ButtonDemo className="rounded-full bg-brand w-12 h-12" />
				</div>
			</div>
		</div>
	</StrictMode>,
);
