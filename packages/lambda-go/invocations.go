package lambda_go_sdk

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
)

func invokeRenderLambda(options RemotionOptions) (*RemotionRenderResponse, error) {

	// Create a new AWS session
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config:            aws.Config{Region: aws.String(options.Region)},
		SharedConfigState: session.SharedConfigEnable,
	}))

	// Create a new Lambda client
	svc := lambda.New(sess)

	internalParams, validateError := constructRenderInternals(&options)

	if validateError != nil {
		return nil, validateError
	}

	internalParamJsonObject, marshallingError := json.Marshal(internalParams)
	if marshallingError != nil {
		return nil, fmt.Errorf("could not serialize render parameters: %w", marshallingError)
	}

	invocationPayload := &lambda.InvokeInput{
		FunctionName: aws.String(options.FunctionName),
		Payload:      internalParamJsonObject,
	}

	// Invoke Lambda function
	invocationResult, invocationError := svc.Invoke(invocationPayload)

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

	// Create a new AWS session
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config:            aws.Config{Region: aws.String(config.Region)},
		SharedConfigState: session.SharedConfigEnable,
	}))

	// Create a new Lambda client
	svc := lambda.New(sess)

	internalParams, validateError := constructGetProgressInternals(&config)

	if validateError != nil {
		return nil, validateError
	}

	internalParamsJSON, marshallingError := json.Marshal(internalParams)
	if marshallingError != nil {
		return nil, fmt.Errorf("could not serialize progress parameters: %w", marshallingError)
	}

	invocationParams := &lambda.InvokeInput{
		FunctionName: aws.String(config.FunctionName),
		Payload:      internalParamsJSON,
	}

	// Invoke Lambda function
	invokeResult, invokeError := svc.Invoke(invocationParams)

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
