import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { UserPool } from "aws-cdk-lib/aws-cognito";

import {
  LambdaIntegration,
  LambdaRestApi,
  CfnAuthorizer,
  TokenAuthorizer,
  AuthorizationType,
} from "aws-cdk-lib/aws-apigateway";

export class ExampleLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const remotionLambda = new lambda.Function(this, "RemotionLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "render_function.handler",
    });

    const RemotionLambdaRestApi = new LambdaRestApi(
      this,
      "remotionLambdaRestApi",
      {
        restApiName: "remotionLambdaRestApi",
        handler: remotionLambda,
        proxy: false,
      }
    );

    // Cognito User Pool with Email Sign-in Type.
    const userPool = new UserPool(this, "userPool", {
      signInAliases: {
        email: true,
      },
    });
    // Authorizer for the Hello World API that uses the
    // Cognito User pool to Authorize users.
    const authorizer = new CfnAuthorizer(this, "cfnAuth", {
      restApiId: RemotionLambdaRestApi.restApiId,
      name: "RemotionLambdaRestApi",
      type: "COGNITO_USER_POOLS",
      identitySource: "method.request.header.Authorization",
      providerArns: [userPool.userPoolArn],
    });

    const renderAPI = RemotionLambdaRestApi.root.addResource("render");
    renderAPI.addMethod("POST", new LambdaIntegration(remotionLambda), {});
  }
}
