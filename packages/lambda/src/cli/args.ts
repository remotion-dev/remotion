import minimist from 'minimist';
import {AwsRegion} from '../pricing/aws-regions';

type LambdaCommandLineOptions = {
	help: boolean;
	region: AwsRegion;
	memory: number;
	timeout: number;
};

export const parsedLambdaCli = minimist<LambdaCommandLineOptions>(
	process.argv.slice(2)
);
