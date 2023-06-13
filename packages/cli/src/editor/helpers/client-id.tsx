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

export const StudioServerConnectionCtx =
	React.createContext<PreviewServerState>({
		type: 'init',
	});

export const studioServerConnectionRef = createRef<{
	set: (jobs: PreviewServerState) => void;
}>();

export const PreviewServerConnection: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [state, setState] = React.useState<PreviewServerState>({
		type: 'init',
	});

	useImperativeHandle(
		studioServerConnectionRef,
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
		<StudioServerConnectionCtx.Provider value={state}>
			{children}
		</StudioServerConnectionCtx.Provider>
	);
};
