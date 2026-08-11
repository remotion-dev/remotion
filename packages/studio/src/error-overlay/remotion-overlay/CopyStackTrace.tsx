import React, {useCallback, useMemo, useState} from 'react';
import {Button} from '../../components/Button';

export const CopyStackTrace: React.FC<{
	readonly errorText: string;
}> = ({errorText}) => {
	const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
		'idle',
	);

	const handleCopyToClipboard = useCallback(() => {
		navigator.clipboard
			.writeText(errorText)
			.then(() => {
				setCopyState('copied');
				setTimeout(() => setCopyState('idle'), 2000);
			})
			.catch(() => {
				setCopyState('failed');
				setTimeout(() => setCopyState('idle'), 2000);
			});
	}, [errorText]);

	const label = useMemo(() => {
		if (copyState === 'copied') {
			return 'Copied!';
		}

		if (copyState === 'failed') {
			return 'Failed!';
		}

		return 'Copy Stacktrace';
	}, [copyState]);

	return <Button onClick={handleCopyToClipboard}>{label}</Button>;
};
