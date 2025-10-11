import type {AwsRegion} from '@remotion/lambda-client';

export const lambdaInsightsExtensions: {[region in AwsRegion]: string | null} =
	{
		'us-east-1':
			'arn:aws:lambda:us-east-1:580247275435:layer:LambdaInsightsExtension-Arm64:5',
		'us-east-2':
			'arn:aws:lambda:us-east-2:580247275435:layer:LambdaInsightsExtension-Arm64:7',
		'us-west-1':
			'arn:aws:lambda:us-west-1:580247275435:layer:LambdaInsightsExtension-Arm64:3',
		'us-west-2':
			'arn:aws:lambda:us-west-2:580247275435:layer:LambdaInsightsExtension-Arm64:5',
		'af-south-1':
			'arn:aws:lambda:af-south-1:012438385374:layer:LambdaInsightsExtension-Arm64:2',
		'ap-east-1':
			'arn:aws:lambda:ap-east-1:519774774795:layer:LambdaInsightsExtension-Arm64:2',
		'ap-south-1':
			'arn:aws:lambda:ap-south-1:580247275435:layer:LambdaInsightsExtension-Arm64:7',
		'ap-northeast-3':
			'arn:aws:lambda:ap-northeast-3:194566237122:layer:LambdaInsightsExtension-Arm64:2',
		'ap-northeast-2':
			'arn:aws:lambda:ap-northeast-2:580247275435:layer:LambdaInsightsExtension-Arm64:4',
		'ap-southeast-1':
			'arn:aws:lambda:ap-southeast-1:580247275435:layer:LambdaInsightsExtension-Arm64:5',
		'ap-southeast-2':
			'arn:aws:lambda:ap-southeast-2:580247275435:layer:LambdaInsightsExtension-Arm64:5',
		'ap-northeast-1':
			'arn:aws:lambda:ap-northeast-1:580247275435:layer:LambdaInsightsExtension-Arm64:11',
		'ca-central-1':
			'arn:aws:lambda:ca-central-1:580247275435:layer:LambdaInsightsExtension-Arm64:3',
		'eu-central-1':
			'arn:aws:lambda:eu-central-1:580247275435:layer:LambdaInsightsExtension-Arm64:5',
		'eu-west-1':
			'arn:aws:lambda:eu-west-1:580247275435:layer:LambdaInsightsExtension-Arm64:5',
		'eu-west-2':
			'arn:aws:lambda:eu-west-2:580247275435:layer:LambdaInsightsExtension-Arm64:5',
		'eu-south-1':
			'arn:aws:lambda:eu-south-1:339249233099:layer:LambdaInsightsExtension-Arm64:2',
		'eu-west-3':
			'arn:aws:lambda:eu-west-3:580247275435:layer:LambdaInsightsExtension-Arm64:3',
		'eu-north-1':
			'arn:aws:lambda:eu-north-1:580247275435:layer:LambdaInsightsExtension-Arm64:3',
		'me-south-1':
			'arn:aws:lambda:me-south-1:285320876703:layer:LambdaInsightsExtension-Arm64:2',
		'sa-east-1':
			'arn:aws:lambda:sa-east-1:580247275435:layer:LambdaInsightsExtension-Arm64:3',
		'ap-southeast-4': null,
		'ap-southeast-5': null,
		'eu-central-2': null,
	};
