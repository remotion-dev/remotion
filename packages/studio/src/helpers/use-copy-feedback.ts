import {useCallback, useEffect, useState} from 'react';

export const useCopyFeedback = () => {
	const [copyCount, setCopyCount] = useState(0);

	useEffect(() => {
		if (copyCount === 0) {
			return;
		}

		const timeout = setTimeout(() => setCopyCount(0), 2000);
		return () => clearTimeout(timeout);
	}, [copyCount]);

	const markCopied = useCallback(() => {
		setCopyCount((currentCopyCount) => currentCopyCount + 1);
	}, []);

	return {copied: copyCount > 0, markCopied};
};
