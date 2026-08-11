import React from 'react';

export type RemotionEnvironment = {
	isStudio: boolean;
	isRendering: boolean;
	isClientSideRendering: boolean;
	isPlayer: boolean;
	isReadOnlyStudio: boolean;
};

export const RemotionEnvironmentContext =
	React.createContext<RemotionEnvironment | null>(null);
