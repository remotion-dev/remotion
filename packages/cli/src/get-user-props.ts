import minimist from 'minimist';

export const getUserProps = (): unknown => {
	const args = minimist<{
		props: string;
	}>(process.argv.slice(2));
	if (!args.props) {
		return {};
	}
	try {
		const parsed = JSON.parse(args.props);
		return parsed;
	} catch (err) {
		console.log(
			'You passed --props but it was not valid JSON and could not be parsed.'
		);
		process.exit(1);
	}
};
