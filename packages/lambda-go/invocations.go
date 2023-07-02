package lambda_go_sdk

import (
	"encoding/json"

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

		return nil, marshallingError
	}

	invocationPayload := &lambda.InvokeInput{
		FunctionName: aws.String(options.FunctionName),
		Payload:      internalParamJsonObject,
	}

	// Invoke Lambda function
	invocationResult, invocationError := svc.Invoke(invocationPayload)

	if invocationError != nil {
		return nil, invocationError
	}

	// Unmarshal response from Lambda function
	var renderResponseOutput RawInvokeResponse

	responseMarshallingError := json.Unmarshal(invocationResult.Payload, &renderResponseOutput)

	if responseMarshallingError != nil {
		return nil, responseMarshallingError
	}

	return SantitiseRenderResponse(renderResponseOutput)
}

func SantitiseRenderResponse(response RawInvokeResponse) (*RemotionRenderResponse, error) {
	var renderBody RemotionBodyResponse

	responseMarshallingError := json.Unmarshal([]byte(response.Body), &renderBody)
	if responseMarshallingError != nil {
		return nil, responseMarshallingError
	}

	return &RemotionRenderResponse{
		StatusCode: response.StatusCode,
		Headers:    response.Headers,
		Body:       renderBody,
	}, nil
}

func invokeRenderProgressLambda(config RenderConfig) (*RenderProgressResponse, error) {

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

		return nil, marshallingError
	}

	invocationParams := &lambda.InvokeInput{
		FunctionName: aws.String(config.FunctionName),
		Payload:      internalParamsJSON,
	}

	// Invoke Lambda function
	invokeResult, invokeError := svc.Invoke(invocationParams)

	if invokeError != nil {
		return nil, invokeError
	}

	// Unmarshal response from Lambda function
	var renderProgressOutput RawInvokeResponse

	resultUnmarshallError := json.Unmarshal(invokeResult.Payload, &renderProgressOutput)
	if resultUnmarshallError != nil {
		return nil, resultUnmarshallError
	}

	return SantitiseProgressResponse(renderProgressOutput)
}

func SantitiseProgressResponse(response RawInvokeResponse) (*RenderProgressResponse, error) {
	var renderProgressBody RenderProgress

	responseMarshallingError := json.Unmarshal([]byte(response.Body), &renderProgressBody)
	if responseMarshallingError != nil {
		print(responseMarshallingError.Error())
		return nil, responseMarshallingError
	}

	return &RenderProgressResponse{
		StatusCode: response.StatusCode,
		Headers:    response.Headers,
		Body:       renderProgressBody,
	}, nil
}
