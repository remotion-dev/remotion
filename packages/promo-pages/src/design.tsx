import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {DesignPage} from './components/design';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div data-theme="light">
			<div className="flex absolute h-full w-full bg-[#F9FAFC] pt-[100px]">
				<div className="w-[800px] mx-auto">
					<DesignPage />
				</div>
			</div>
		</div>
	</StrictMode>,
);
