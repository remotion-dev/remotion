const cp = require('node:child_process');
const fs = require('node:fs');

cp.execSync('unzip -o remotionlambda.zip  -d extracted');
const contents = fs.readFileSync('extracted/index.js', 'utf-8');
fs.rmSync('extracted', {recursive: true});
const [, inLambda] = contents.match(/exports\.VERSION = "(.*)"/);

const inConstants = fs.readFileSync('dist/shared/constants.js', 'utf-8');
const [, inPkg] = inConstants.match(/exports\.VERSION = '(.*)'/);

if (inLambda !== inPkg) {
	console.error(
		`Version in Lambda is ${inLambda}, and in package ${inPkg}. Align the versions.`
	);
	process.exit(1);
}

console.log(`Lambda version ${inLambda} aligns.`);
