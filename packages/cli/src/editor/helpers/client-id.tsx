import React, {createRef, useImperativeHandle} from 'react';

type PreviewServerState =
	| {
			type: 'init';
	  }
	| {
			type: 'connected';
			clientId: string;
	  }
	| {
			type: 'disconnected';
	  };

export const PreviewServerConnectionCtx =
	React.createContext<PreviewServerState>({
		type: 'init',
	});

export const previewServerConnectionRef = createRef<{
	set: (jobs: PreviewServerState) => void;
}>();

export const PreviewServerConnection: React.FC<{
	children: React.ReactNode;
	type: 'editor';
}> = ({children}) => {
	const [state, setState] = React.useState<PreviewServerState>({
		type: 'init',
	});

	useImperativeHandle(
		previewServerConnectionRef,
		() => {
			return {
				set: (newState) => {
					setState(newState);
				},
			};
		},
		[]
	);

	return (
		<PreviewServerConnectionCtx.Provider value={state}>
			{children}
		</PreviewServerConnectionCtx.Provider>
	);
};
