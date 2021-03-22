import fs from 'fs';
import path from 'path';
import {parsedCli} from './parse-command-line';

export const getUserProps = (): unknown => {
	if (!parsedCli.props) {
		return {};
	}
	const jsonFile = path.resolve(process.cwd(), parsedCli.props);
	try {
		const splitProps = parsedCli.props.split('.');
		if (splitProps[splitProps.length - 1] === 'json') {
			const rawJsonData = fs.readFileSync(jsonFile, 'utf-8');
			const parsed = JSON.parse(rawJsonData);
			return parsed;
		} else {
			const parsed = JSON.parse(parsedCli.props);
			return parsed;
		}
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.log(err.message);
		} else {
			console.log(
				'You passed --props but it was not valid JSON and could not be parsed.'
			);
		}
		process.exit(1);
	}
};
