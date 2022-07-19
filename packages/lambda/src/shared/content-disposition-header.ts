// By setting the Content-Disposition header in an S3 object,
// you can control if the user downloads the item if you
// visit the link

export type DownloadBehavior =
	| {
			type: 'play-in-browser';
	  }
	| {
			type: 'download';
			fileName: string | null;
	  };

export const getContentDispositionHeader = (
	behavior: DownloadBehavior | null
): string | undefined => {
	if (behavior === null) {
		return undefined;
	}

	if (behavior.type === 'play-in-browser') {
		return undefined;
	}

	if (behavior.fileName === null) {
		return `attachment`;
	}

	return `attachment; filename="${behavior.fileName}"`;
};
