import minimist from 'minimist';
import {AwsRegion} from '../pricing/aws-regions';

type LambdaCommandLineOptions = {
	help: boolean;
	region: AwsRegion;
};

export const parsedLambdaCli = minimist<LambdaCommandLineOptions>(
	process.argv.slice(2)
);
