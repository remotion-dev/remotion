import type {ComponentType} from 'react';
import {renderToString} from 'react-dom/server';

export const getCompositionsOnServer = (Comp: ComponentType) => {
	process.env.REMOTION_SERVER_RENDERING = 'true';
	console.log(renderToString(<Comp />));
};
