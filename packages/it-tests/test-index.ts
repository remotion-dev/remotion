const {getVideoMetadata} = require('@remotion/renderer');

getVideoMetadata(process.argv[2]).then((metadata) => {
	console.log(metadata.codec);
});
