import {makeMatroskaHeader} from './matroska-header';

export const createMedia = async () => {
	const header = makeMatroskaHeader();

	const handle = await window.showSaveFilePicker({
		suggestedName: 'out.webm',
		types: [
			{
				description: 'WebM video',
				accept: {'video/webm': ['.webm']},
			},
		],
	});

	const writable = await handle.createWritable();
	await writable.write(header);

	writable.close();
};
