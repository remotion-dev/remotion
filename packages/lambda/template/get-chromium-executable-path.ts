import {readdirSync} from 'fs';
import LambdaFS from 'lambdafs';

if (
	/^AWS_Lambda_nodejs(?:10|12|14)[.]x$/.test(process.env.AWS_EXECUTION_ENV) ===
	true
) {
	if (process.env.FONTCONFIG_PATH === undefined) {
		process.env.FONTCONFIG_PATH = '/tmp/aws';
	}

	if (process.env.LD_LIBRARY_PATH === undefined) {
		process.env.LD_LIBRARY_PATH = '/tmp/aws/lib';
	} else if (process.env.LD_LIBRARY_PATH.startsWith('/tmp/aws/lib') !== true) {
		process.env.LD_LIBRARY_PATH = [
			...new Set(['/tmp/aws/lib', ...process.env.LD_LIBRARY_PATH.split(':')]),
		].join(':');
	}
}

export const executablePath = async (): Promise<string> => {
	console.log('/var/lang/bin', readdirSync('/var/lang/bin'));
	console.log('/usr/local/bin', readdirSync('/usr/local/bin'));
	console.log('/usr/bin', readdirSync('/usr/bin'));
	console.log('/bin', readdirSync('/bin'));
	console.log('/opt/bin', readdirSync('/opt/bin'));
	const promises = [
		LambdaFS.inflate('/opt/bin/chromium.br'),
		LambdaFS.inflate('/opt/bin/swiftshader.tar.br'),
	];

	promises.push(LambdaFS.inflate('/opt/bin/aws.tar.br'));

	const result = await Promise.all(promises);
	return result.shift();
};
