const {getSilentParts} = require('@remotion/renderer');

// @ts-expect-error cjs
getSilentParts({src: process.argv[2]}).then((result) => {
	console.log(result.durationInSeconds);
});
