import {iam, lambda, s3} from 'aws-policies';
import {validateAll} from '../iam-validation/validate-all';

// Not exhaustive, but to test out aws-policies packages
const necessaryPolicies = [
	s3.GetObject,
	iam.CreateGroup,
	lambda.Publish,
	lambda.Invoke,
	lambda.InvokeFunction,
];

console.log('should have policies', necessaryPolicies);

export const infoCommand = async () => {
	await validateAll();
};
