import {isHomebrewInstalled} from '@remotion/renderer';

export const handler = async (event, context, callback) => {
	console.log('Remotion is running', await isHomebrewInstalled());
};
