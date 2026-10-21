import React from 'react';
import type {WordArtProps} from './types';
import {WordArtRenderer} from './word-art-renderer';

/**
 * Slanted silver text with a reflective gradient and metallic outline.
 * @see [Documentation](https://www.remotion.dev/docs/wordart/chrome-word-art)
 */
export const ChromeWordArt: React.FC<WordArtProps> = (props) => {
	return <WordArtRenderer {...props} preset="chrome" />;
};
