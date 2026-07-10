package lambda_go_sdk

import (
	"context"
	"encoding/json"
	"fmt"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
)

func invokeRenderLambda(options RemotionOptions) (*RemotionRenderResponse, error) {

	awsConfig, configError := awsconfig.LoadDefaultConfig(
		context.TODO(),
		awsconfig.WithRegion(options.Region),
	)
	if configError != nil {
		return nil, fmt.Errorf("could not load AWS config: %w", configError)
	}
	svc := lambda.NewFromConfig(awsConfig)

	internalParams, validateError := constructRenderInternals(&options)

	if validateError != nil {
		return nil, validateError
	}

	internalParamJsonObject, marshallingError := json.Marshal(internalParams)
	if marshallingError != nil {
		return nil, fmt.Errorf("could not serialize render parameters: %w", marshallingError)
	}

	invocationPayload := &lambda.InvokeInput{
		FunctionName: new(options.FunctionName),
		Payload:      internalParamJsonObject,
	}

	// Invoke Lambda function
	invocationResult, invocationError := svc.Invoke(context.TODO(), invocationPayload)

	if invocationError != nil {
		return nil, fmt.Errorf("could not invoke Lambda function %q: %w", options.FunctionName, invocationError)
	}

	// Unmarshal response from Lambda function
	var renderResponseOutput RemotionRenderResponse

	responseMarshallingError := json.Unmarshal(invocationResult.Payload, &renderResponseOutput)

	if responseMarshallingError != nil {
		return nil, fmt.Errorf("could not parse Lambda response: %w", responseMarshallingError)
	}

	return &renderResponseOutput, nil
}

func invokeRenderProgressLambda(config RenderConfig) (*RenderProgress, error) {

	awsConfig, configError := awsconfig.LoadDefaultConfig(
		context.TODO(),
		awsconfig.WithRegion(config.Region),
	)
	if configError != nil {
		return nil, fmt.Errorf("could not load AWS config: %w", configError)
	}
	svc := lambda.NewFromConfig(awsConfig)

	internalParams, validateError := constructGetProgressInternals(&config)

	if validateError != nil {
		return nil, validateError
	}

	internalParamsJSON, marshallingError := json.Marshal(internalParams)
	if marshallingError != nil {
		return nil, fmt.Errorf("could not serialize progress parameters: %w", marshallingError)
	}

	invocationParams := &lambda.InvokeInput{
		FunctionName: new(config.FunctionName),
		Payload:      internalParamsJSON,
	}

	// Invoke Lambda function
	invokeResult, invokeError := svc.Invoke(context.TODO(), invocationParams)

	if invokeError != nil {
		return nil, fmt.Errorf("could not invoke Lambda function %q: %w", config.FunctionName, invokeError)
	}

	// Unmarshal response from Lambda function
	var renderProgressOutput RenderProgress

	resultUnmarshallError := json.Unmarshal(invokeResult.Payload, &renderProgressOutput)
	if resultUnmarshallError != nil {
		return nil, fmt.Errorf("could not parse Lambda progress response: %w", resultUnmarshallError)
	}

	return &renderProgressOutput, nil
}
