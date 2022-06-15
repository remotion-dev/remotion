import React, {useCallback} from 'react';
import {Button} from './Button';

export const SearchGithubIssues: React.FC<{
	message: string;
}> = ({message}) => {
	const openInBrowser = useCallback(() => {
		window.open(
			`https://github.com/remotion-dev/remotion/issues?q=${encodeURIComponent(
				message
			)}`,
			'_blank'
		);
	}, [message]);
	return <Button onClick={openInBrowser}>Search GitHub Issues</Button>;
};
