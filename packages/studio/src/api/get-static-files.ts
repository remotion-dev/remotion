let warnedServer = false;
let warnedPlayer = false;

const warnServerOnce = () => {
	if (warnedServer) {
		return;
	}

	warnedServer = true;
	// eslint-disable-next-line no-console
	console.warn(
		'Called getStaticFiles() on the server. The API is only available in the browser. An empty array was returned.',
	);
};

const warnPlayerOnce = () => {
	if (warnedPlayer) {
		return;
	}

	warnedPlayer = true;
	// eslint-disable-next-line no-console
	console.warn(
		'Called getStaticFiles() while using the Remotion Player. The API is only available while using the Remotion Studio. An empty array was returned.',
	);
};

/*
 * @description Gets an array containing all files in the `public/` folder. You can reference them by using `staticFile()`.
 * @see [Documentation](https://www.remotion.dev/docs/studio/get-static-files)
 */
export const getStaticFiles = (): StaticFile[] => {
	if (typeof document === 'undefined') {
		warnServerOnce();
		return [];
	}

	if (window.remotion_isPlayer) {
		warnPlayerOnce();
		return [];
	}

	return window.remotion_staticFiles;
};

export type StaticFile = {
	/**
	 * A string that you can pass to the `src` attribute of an `<Audio>`, `<Img>`, `<Video>`, `<Html5Audio>`, `<Html5Video>` or `<OffthreadVideo>` element.
	 */
	src: string;
	/**
	 * The filepath of the file, relative to the public folder.
	 * Example: `subfolder/image.png`
	 */
	name: string;
	sizeInBytes: number;
	/**
	 * UNIX timestamp in milliseconds
	 */
	lastModified: number;
};
