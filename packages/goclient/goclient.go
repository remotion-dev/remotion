package goclient

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
)

func invokeLambda(options *RemotionOptions) (interface{}, error) {

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
		println("Result error " + err.Error())
		return result, err
	}

	// Inspect the response
	if result.FunctionError != nil {
		println("Invoke Lambda FunctionError " + *result.FunctionError)
	}

	// Get the actual response payload
	response := result.Payload

	fmt.Println("responseXXX")
	fmt.Println(response)

	// Handle response from Lambda function
	var output interface{}
	err = json.Unmarshal(response, &output)
	if err != nil {
		return nil, err
	}

	// Do something with the output from Lambda function
	fmt.Println(output)

	return nil, err
}

func Render(input *RemotionOptions) (interface{}, error) {
	return invokeLambda(input)
}
