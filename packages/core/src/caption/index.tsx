import {useContext, useEffect} from 'react';
import type {TCaption} from '../CompositionManager';
import {CompositionManager} from '../CompositionManager';
import {getRemotionEnvironment} from '../get-environment';

type CaptionProps = Omit<TCaption, 'id' | 'isRemote'>;

export const Caption = (props: CaptionProps) => {
	const {language, src, title} = props;
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
			title,
		});

		return () => unregisterCaption(id);
	}, [language, registerCaption, src, title, unregisterCaption]);

	return null;
};
