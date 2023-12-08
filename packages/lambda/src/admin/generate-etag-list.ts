import hex from 'crypto-js/enc-hex';
import md5 from 'crypto-js/md5';
import {writeFileSync} from 'node:fs';

const md5Func = (data: string) => hex.stringify(md5(data));

const chunks: string[] = [];
for (let i = 0; i < 2000; i++) {
	const etag = `"${md5Func(String(i))}"`;
	chunks.push(etag);
}

writeFileSync('etags.json', JSON.stringify(chunks));
