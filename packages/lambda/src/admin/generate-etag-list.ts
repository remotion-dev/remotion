import crypto from 'node:crypto';
import {writeFileSync} from 'node:fs';

const md5 = (data: string) =>
	crypto.createHash('md5').update(data).digest('hex');

const chunks: string[] = [];
for (let i = 0; i < 2000; i++) {
	const etag = `"${md5(String(i))}"`;
	chunks.push(etag);
}

writeFileSync('etags.json', JSON.stringify(chunks));
