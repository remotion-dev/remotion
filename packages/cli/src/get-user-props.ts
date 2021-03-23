import {parsedCli} from './parse-command-line';

export const getUserProps = (): object => {
	if (!parsedCli.props) {
		return {};
	}
	try {
		const parsed = JSON.parse(parsedCli.props);
		return parsed as object;
	} catch (err) {
		console.log(
			'You passed --props but it was not valid JSON and could not be parsed.'
		);
		process.exit(1);
	}
};
