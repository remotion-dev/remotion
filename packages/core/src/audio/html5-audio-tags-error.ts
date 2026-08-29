export class Html5AudioTagsError extends Error {
	constructor(numberOfAudioTags: number) {
		super(
			`Tried to simultaneously mount ${
				numberOfAudioTags + 1
			} <Html5Audio /> tags at the same time. With the current settings, the maximum amount of <Html5Audio /> tags is limited to ${numberOfAudioTags} at the same time. Remotion pre-mounts silent audio tags to help avoid browser autoplay restrictions. See https://remotion.dev/docs/player/autoplay#using-the-numberofsharedaudiotags-prop for more information on how to increase this limit.`,
		);
		this.name = 'Html5AudioTagsError';
	}
}
