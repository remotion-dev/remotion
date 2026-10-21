import React from 'react';
import type {WordArtProps} from './types';
import {WordArtRenderer} from './word-art-renderer';

/**
 * Cyan-to-blue text on a wavy baseline with dark blue extrusion.
 * @see [Documentation](https://www.remotion.dev/docs/wordart/blue-wave-word-art)
 */
export const BlueWaveWordArt: React.FC<WordArtProps> = (props) => {
	return <WordArtRenderer {...props} preset="blue-wave" />;
};
