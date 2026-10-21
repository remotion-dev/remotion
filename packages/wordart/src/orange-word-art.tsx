import React from 'react';
import type {WordArtProps} from './types';
import {WordArtRenderer} from './word-art-renderer';

/**
 * Slanted gold-to-orange text with deep brown extrusion.
 * @see [Documentation](https://www.remotion.dev/docs/wordart/orange-word-art)
 */
export const OrangeWordArt: React.FC<WordArtProps> = (props) => {
	return <WordArtRenderer {...props} preset="orange" />;
};
