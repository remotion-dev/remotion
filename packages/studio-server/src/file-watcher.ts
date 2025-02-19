import fs from 'node:fs';

type FileChangeType = 'created' | 'deleted' | 'changed';

export const installFileWatcher = ({
	file,
	onChange,
}: {
	file: string;
	onChange: (type: FileChangeType) => void;
}): {exists: boolean; unwatch: () => void} => {
	const existedAtBeginning = fs.existsSync(file);
	let existedBefore = existedAtBeginning;

	const listener = () => {
		const existsNow = fs.existsSync(file);
		if (!existedBefore && existsNow) {
			onChange('created');
			existedBefore = true;
			return;
		}

		if (existedBefore && !existsNow) {
			onChange('deleted');
			existedBefore = false;
			return;
		}

		if (existsNow) {
			if (typeof Deno !== 'undefined') {
				// Deno always goes here, even if the file has not changed.
				// Don't support this for now.
				return;
			}

			onChange('changed');
		}
	};

	fs.watchFile(file, {interval: 100}, listener);

	return {
		exists: existedAtBeginning,
		unwatch: () => {
			fs.unwatchFile(file, listener);
		},
	};
};
