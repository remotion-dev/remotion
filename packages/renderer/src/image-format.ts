// Keeping the default image format PNG if you don't pass a
// value to the renderer for backwards compatibility.

import {ImageFormat} from 'remotion';

// However, the CLI will override it and use JPEG if suitable.
export const DEFAULT_IMAGE_FORMAT: ImageFormat = 'png';
