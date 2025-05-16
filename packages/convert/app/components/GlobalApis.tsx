import {MediaParserInternals} from '@remotion/media-parser';
import {useEffect} from 'react';

export const GlobalApisInConsole = () => {
	useEffect(() => {
		Promise.all([
			import('@remotion/media-parser').then(({parseMedia}) => {
				// @ts-expect-error
				window.parseMedia = parseMedia;
			}),

			import('@remotion/webcodecs').then(({convertMedia}) => {
				// @ts-expect-error
				window.convertMedia = convertMedia;
			}),
		]).then(() => {
			MediaParserInternals.Log.info(
				'info',
				'Tip: You can use parseMedia() and convertMedia() in this console!',
			);
		});
	}, []);

	return <div />;
};
