import React from 'react';

interface RemotionThreeContextType {
	useDomNode: (node: React.ReactElement) => void;
}

const RemotionThreeContext = React.createContext<
	RemotionThreeContextType | undefined
>(undefined);

function useRemotionThreeContext() {
	const ctx = React.useContext(RemotionThreeContext);
	if (!ctx) {
		throw new Error(
			'useRemotionThreeContext used outside RemotionThreeContext'
		);
	}
	return ctx;
}

export function useRemotionThreeDomNode(node: React.ReactElement) {
	return useRemotionThreeContext().useDomNode(node);
}
