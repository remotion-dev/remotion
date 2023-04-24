package goclient

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
)

func invokeLambda(options *RemotionOptions) error {
	// Create a new AWS session
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	// Create a new Lambda client
	svc := lambda.New(sess)

	// Create input for Lambda function
	_, err := json.Marshal(options)
	if err != nil {
		return err
	}

	internalParams := constructInternals(options)
	internalParamByte, err := json.Marshal(internalParams)
	if err != nil {
		return err
	}

	params := &lambda.InvokeInput{
		FunctionName: aws.String(options.FunctionName),
		Payload:      internalParamByte,
	}

	// Invoke Lambda function
	resp, err := svc.Invoke(params)
	if err != nil {
		return err
	}

	// Handle response from Lambda function
	var output RemotionRenderResponse
	err = json.Unmarshal(resp.Payload, &output)
	if err != nil {
		return err
	}

	// Do something with the output from Lambda function
	fmt.Println(output)

	return nil
}

func Render(input *RemotionOptions) error {
	return invokeLambda(input)
}
