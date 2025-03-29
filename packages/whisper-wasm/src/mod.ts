export type ModelState = {
	transcriptionProgressPlayback: null | ((progress: number) => void);
	transcriptionChunkPlayback:
		| null
		| ((
				timestampStart: string,
				timestampEnd: string,
				textOnly: string,
		  ) => void);
	resolver: null | ((text: string) => void);
};
