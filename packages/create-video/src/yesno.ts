// Duplicated in Lambda

import readline from 'readline';

const options = {
	yes: ['yes', 'y'],
	no: ['no', 'n'],
};

function defaultInvalidHandler({
	yesValues,
	noValues,
}: {
	question: string;
	yesValues: string[];
	noValues: string[];
}) {
	process.stdout.write('\nInvalid Response.\n');
	process.stdout.write('Answer either yes : (' + yesValues.join(', ') + ') \n');
	process.stdout.write('Or no: (' + noValues.join(', ') + ') \n\n');
}

export const yesOrNo = ({
	question,
	defaultValue,
}: {
	question: string;
	defaultValue: boolean;
}) => {
	const invalid = defaultInvalidHandler;

	const yesValues = options.yes.map((v) => v.toLowerCase());
	const noValues = options.no.map((v) => v.toLowerCase());

	const rl = readline.createInterface({
		input: process.stdin as unknown as NodeJS.ReadableStream,
		output: process.stdout as unknown as NodeJS.WritableStream,
	});

	return new Promise<boolean>((resolve) => {
		rl.question(question + ' ', async (answer) => {
			rl.close();

			const cleaned = answer.trim().toLowerCase();

			if (cleaned === '' && defaultValue !== null) return resolve(defaultValue);

			if (yesValues.indexOf(cleaned) >= 0) return resolve(true);

			if (noValues.indexOf(cleaned) >= 0) return resolve(false);

			invalid({question, yesValues, noValues});
			const result = await yesOrNo({
				question,
				defaultValue,
			});
			resolve(result);
		});
	});
};
