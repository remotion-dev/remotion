import {matchesPattern} from './detect-file-type';

export type PdfType = {
	type: 'pdf';
};

export const isPdf = (data: Uint8Array): PdfType | null => {
	if (data.length < 4) {
		return null;
	}

	const pdfPattern = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

	return matchesPattern(pdfPattern)(data.subarray(0, 4)) ? {type: 'pdf'} : null;
};
