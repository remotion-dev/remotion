import fs from 'fs';

type FileChangeType = 'created' | 'deleted' | 'changed';

export const installFileWatcher = ({
	file,
	onChange,
}: {
	file: string;
	onChange: (type: FileChangeType) => void;
}): (() => void) => {
	let existedBefore = fs.existsSync(file);

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
			onChange('changed');
		}
	};

	fs.watchFile(file, {interval: 100}, listener);

	return () => {
		fs.unwatchFile(file, listener);
	};
};
