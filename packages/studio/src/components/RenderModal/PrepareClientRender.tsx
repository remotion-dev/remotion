import {useEffect, useState} from 'react';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {waitForHotUpdate} from '../../hot-middleware-client/wait-for-hot-update';
import {callApi} from '../call-api';
import {ModalHeader} from '../ModalHeader';
import {loaderLabel} from '../RunningCalculateMetadata';

export const PrepareClientRender: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [state, setState] = useState<'loading' | 'ready' | Error>(() =>
		window.remotion_isReadOnlyStudio || getBrowserStudioOperations() !== null
			? 'ready'
			: 'loading',
	);

	useEffect(() => {
		if (
			window.remotion_isReadOnlyStudio ||
			getBrowserStudioOperations() !== null
		) {
			return;
		}

		const controller = new AbortController();
		callApi('/api/prepare-client-render', {}, controller.signal)
			.then(({hash}) => waitForHotUpdate(hash, controller.signal))
			.then(() => setState('ready'))
			.catch((error) => {
				if (!controller.signal.aborted) {
					setState(error);
				}
			});
		return () => controller.abort();
	}, []);

	if (state === 'ready') {
		return children;
	}

	return (
		<div>
			<ModalHeader title="Preparing export" />
			<div
				style={{...loaderLabel, padding: 20}}
				role={state === 'loading' ? 'status' : 'alert'}
			>
				{state === 'loading' ? 'Loading the latest changes…' : state.message}
			</div>
		</div>
	);
};
