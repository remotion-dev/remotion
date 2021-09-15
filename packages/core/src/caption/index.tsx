import {useContext, useEffect} from 'react';
import {CompositionManager} from '../CompositionManager';
import {getRemotionEnvironment} from '../get-environment';
import {isRemoteAsset} from '../is-remote-asset';

interface CaptionProps {
	language?: string;
	src: string;
}

export const Caption = (props: CaptionProps) => {
	const {language, src} = props;
	const {registerCaption, unregisterCaption} = useContext(CompositionManager);

	useEffect(() => {
		if (getRemotionEnvironment() !== 'rendering') {
			return;
		}

		const id = `caption-${src}`;

		registerCaption({
			id,
			language,
			src,
			isRemote: isRemoteAsset(src),
		});

		return () => unregisterCaption(id);
	}, [language, registerCaption, src, unregisterCaption]);

	return null;
};
