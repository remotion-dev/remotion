import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {
  LambdaIntegration,
  LambdaRestApi,
  TokenAuthorizer,
} from "aws-cdk-lib/aws-apigateway";

export class ExampleLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
    const authorizerFn = new lambda.Function(this, "BasicAuthAuthorizer", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("authorizer"),
      handler: "authorizer.handler",
    });

    const authorizer = new TokenAuthorizer(this, "CustomBasicAuthAuthorizer", {
      handler: authorizerFn,
      identitySource: "method.request.header.Authorization",
    });

     */
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

    const renderAPI = RemotionLambdaRestApi.root.addResource("render");

    renderAPI.addMethod("POST", new LambdaIntegration(remotionLambda), {});
  }
}
