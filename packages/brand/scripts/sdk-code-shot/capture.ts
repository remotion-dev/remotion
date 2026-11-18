import path from 'node:path';
import {captureCode} from '../capture-code';

await captureCode([
	{
		url: 'http://127.0.0.1:3040/',
		output: path.resolve(process.argv[2] ?? '/tmp/sdk-monaco-source.png'),
		width: 1180,
		height: 1180,
	},
]);
