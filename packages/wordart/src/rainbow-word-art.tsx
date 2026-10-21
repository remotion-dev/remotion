import React from 'react';
import type {WordArtProps} from './types';
import {WordArtRenderer} from './word-art-renderer';

/**
 * Arched rainbow text with a gray drop shadow.
 * @see [Documentation](https://www.remotion.dev/docs/wordart/rainbow-word-art)
 */
export const RainbowWordArt: React.FC<WordArtProps> = (props) => {
	return <WordArtRenderer {...props} preset="rainbow" />;
};
