import crypto from 'crypto';
import fs from 'fs';

const md5 = (data: Buffer) =>
	crypto.createHash('md5').update(data).digest('hex');

export const getEtagOfFile = async (filePath: string) => {
	const stream = await fs.promises.readFile(filePath);
	return md5(stream);
};
