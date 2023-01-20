import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apiGatewayAuthorizers from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import * as apiGatewayIntegrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class RemotionLambdaStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 create the user pool
    const userPool = new cognito.UserPool(this, "userpool", {
      userPoolName: `remotion-starter-user-pool`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    // 👇 create the user pool client
    const userPoolClient = new cognito.UserPoolClient(
      this,
      "remotion-starter-userpool-client",
      {
        userPool,
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
          custom: true,
          userSrp: true,
        },
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
      }
    );

    // 👇 create a role with custom name
    const remotionLambdaServerlessRole = new Role(
      this,
      "remotionLambdaServerlessRole",
      {
        roleName: "remotionLambdaServerlessRole",
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    // 👇 create render function
    const remotionRenderFunction = new NodejsFunction(this, "render-function", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "main",
      entry: path.join(__dirname, `/../src/render-function/index.ts`),
      role: remotionLambdaServerlessRole,
    });

    // 👇 create the API
    const httpApi = new apiGateway.HttpApi(this, "api", {
      apiName: `remotion-api`,
    });

    // 👇 create the Authorizer
    const authorizer = new apiGatewayAuthorizers.HttpUserPoolAuthorizer(
      "remotion-user-pool-authorizer",
      userPool,
      {
        userPoolClients: [userPoolClient],
        identitySource: ["$request.header.Authorization"],
      }
    );

    // 👇 set the Authorizer on the Route
    httpApi.addRoutes({
      integration: new apiGatewayIntegrations.HttpLambdaIntegration(
        "remotion-fn-integration",
        remotionRenderFunction
      ),
      path: "/render",
      authorizer,
    });

    new cdk.CfnOutput(this, "region", { value: cdk.Stack.of(this).region });
    new cdk.CfnOutput(this, "userPoolId", { value: userPool.userPoolId });
    new cdk.CfnOutput(this, "userPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "apiUrl", {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: httpApi.url!,
    });
  }
}
