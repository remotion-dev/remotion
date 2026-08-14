import {expect, test} from 'bun:test';
import {resolveCallerArnForSimulation} from '../../api/iam-validation/resolve-caller-arn';

test('permission simulation resolves users and assumed roles in both partitions', () => {
	expect(
		resolveCallerArnForSimulation({
			callerIdentityArn: 'arn:aws-cn:iam::123456789012:user/example',
			region: 'cn-north-1',
			regionPartition: 'aws-cn',
		}),
	).toBe('arn:aws-cn:iam::123456789012:user/example');
	expect(
		resolveCallerArnForSimulation({
			callerIdentityArn:
				'arn:aws-cn:sts::123456789012:assumed-role/example/session',
			region: 'cn-northwest-1',
			regionPartition: 'aws-cn',
		}),
	).toBe('arn:aws-cn:iam::123456789012:role/example');
	expect(
		resolveCallerArnForSimulation({
			callerIdentityArn:
				'arn:aws:sts::123456789012:assumed-role/example/session',
			region: 'us-east-1',
			regionPartition: 'aws',
		}),
	).toBe('arn:aws:iam::123456789012:role/example');
	expect(() =>
		resolveCallerArnForSimulation({
			callerIdentityArn: 'arn:aws:iam::123456789012:user/example',
			region: 'cn-north-1',
			regionPartition: 'aws-cn',
		}),
	).toThrow('does not match region cn-north-1');
});
