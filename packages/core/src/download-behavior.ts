export type DownloadBehavior =
	| {
			type: 'play-in-browser';
	  }
	| {
			type: 'download';
			fileName: string | null;
	  };
