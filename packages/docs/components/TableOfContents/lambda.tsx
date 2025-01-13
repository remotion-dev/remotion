import React from 'react';
import {Grid} from './Grid';
import {TOCItem} from './TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/lambda/estimateprice">
					<strong>estimatePrice()</strong>
					<div>Estimate the price of a render</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/deployfunction">
					<strong>deployFunction()</strong>
					<div>Create a new function in AWS Lambda</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/deletefunction">
					<strong>deleteFunction()</strong>
					<div>Delete a function in AWS Lambda</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getfunctioninfo">
					<strong>getFunctionInfo()</strong>
					<div>Gets information about a function</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getfunctions">
					<strong>getFunctions()</strong>
					<div>Lists available Remotion Lambda functions</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getcompositionsonlambda">
					<strong>getCompositionsOnLambda()</strong>
					<div>Gets list of compositions inside a Lambda function</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/deletesite">
					<strong>deleteSite()</strong>
					<div>Delete a bundle from S3</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/deploysite">
					<strong>deploySite()</strong>
					<div>Bundle and upload a site to S3</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getawsclient">
					<strong>getAwsClient()</strong>
					<div>Access the AWS SDK directly</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getregions">
					<strong>getRegions()</strong>
					<div>Get all available regions</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getsites">
					<strong>getSites()</strong>
					<div>Get all available sites</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/downloadmedia">
					<strong>downloadMedia()</strong>
					<div>Download a render artifact from S3</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getuserpolicy">
					<strong>getUserPolicy()</strong>
					<div>Get the policy JSON for your AWS user</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getrolepolicy">
					<strong>getRolePolicy()</strong>
					<div>Get the policy JSON for your AWS role</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getorcreatebucket">
					<strong>getOrCreateBucket()</strong>
					<div>Ensure a Remotion S3 bucket exists</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/getrenderprogress">
					<strong>getRenderProgress()</strong>
					<div>Query the progress of a render</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/presignurl">
					<strong>presignUrl()</strong>
					<div>Make a private file public to those with the link</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/rendermediaonlambda">
					<strong>renderMediaOnLambda()</strong>
					<div>Trigger a video or audio render</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/renderstillonlambda">
					<strong>renderStillOnLambda()</strong>
					<div>Trigger a still render</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/simulatepermissions">
					<strong>simulatePermissions()</strong>
					<div>Ensure permissions are correctly set up</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/speculatefunctionname">
					<strong>speculateFunctionName()</strong>
					<div>Get the lambda function name based on its configuration</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/validatewebhooksignature">
					<strong>validateWebhookSignature()</strong>
					<div>Validate an incoming webhook request is authentic</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/approuterwebhook">
					<strong>appRouterWebhook()</strong>
					<div>
						Handle incoming webhooks specifically for the Next.js app router
					</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/pagesrouterwebhook">
					<strong>pagesRouterWebhook()</strong>
					<div>
						Handle incoming webhooks specifically for the Next.js pages router
					</div>
				</TOCItem>
				<TOCItem link="/docs/lambda/expresswebhook">
					<strong>expressWebhook()</strong>
					<div>
						Handle incoming webhooks specifically for Express.js
					</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
