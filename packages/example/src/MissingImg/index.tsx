import React from 'react';
import {Img} from 'remotion';

export const MissingImg = (): React.ReactNode => {
	// eslint-disable-next-line @remotion/no-string-assets
	return <Img src="doesnotexist" />;
};
