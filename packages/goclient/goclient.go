package goclient

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
)

func parseLambdaResponse(response []byte) (map[string]interface{}, error) {
	var output map[string]interface{}
	err := json.Unmarshal(response, &output)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Lambda response: %s", err)
	}
	return output, nil
}

func invokeLambda(options *RemotionOptions) (map[string]interface{}, error) {

	// Create a new AWS session
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config:            aws.Config{Region: aws.String(options.Region)},
		SharedConfigState: session.SharedConfigEnable,
	}))

	// Create a new Lambda client
	svc := lambda.New(sess)

	// Create input for Lambda function
	_, err := json.Marshal(options)
	if err != nil {

		return nil, err
	}

	internalParams := constructInternals(options)
	internalParamByte, err := json.Marshal(internalParams)
	if err != nil {

		return nil, err
	}

	params := &lambda.InvokeInput{
		FunctionName: aws.String(options.FunctionName),
		Payload:      internalParamByte,
	}

	// Invoke Lambda function
	result, err := svc.Invoke(params)

	if err != nil {
		return nil, err
	}

	// Unmarshal response from Lambda function
	var output map[string]interface{}
	err = json.Unmarshal(result.Payload, &output)
	if err != nil {
		return nil, err
	}

	return output, nil
}

func RenderMedia(input *RemotionOptions) (interface{}, error) {
	return invokeLambda(input)
}
