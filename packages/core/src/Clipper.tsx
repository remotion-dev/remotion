import type React from 'react';

/**
 * @deprecated <Clipper> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.
 */
export const Clipper: React.FC<{}> = () => {
	throw new Error(
		'<Clipper> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.',
	);
};
