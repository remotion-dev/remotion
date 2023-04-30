---
title: Triggering renders from Go
slug: /lambda/go
sidebar_label: Rendering from Go
crumb: "@remotion/lambda"
---

To trigger a Lambda render using Go, you will need to utilize, a go package. Note the following:

- You first need to [complete the Lambda setup](/docs/lambda/setup).
- Sending large input props (>200KB) is not supported with Go at the moment.


:::warning
The go package utilised on this example is in early stage of development.
:::

```go title="main.go"
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/remotion-dev/remotion/packages/goclient"
)

type ValidationError struct {
	Field   string
	Message string
}

func msgForTag(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "This field is required"

	}
	return fe.Error() // default error
}

func main() {

	// Load the environment variables from the .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	// Specify the URL to your Webpack bundle
	serveUrl := os.Getenv("REMOTION_APP_SERVE_URL")
	// Specify the function you would like to call
	functionName := os.Getenv("REMOTION_APP_FUNCTION_NAME")
	// Specify the region you deployed to, for example "us-east-1"
	region := os.Getenv("REMOTION_APP_REGION")

	input := goclient.RemotionOptions{
		ServeUrl:     serveUrl,
		FunctionName: functionName,
		Region:       region,
		// The data that composition will use
		InputProps: map[string]interface{}{
			"data": "Let's play",
		},
		Composition: "main",   // The composition to use
		Version:     "3.3.78", // Specify the Remotion version to use
	}
	response, error := goclient.RenderMediaOnLambda(input)

	if error != nil {

		validationOut := make([]ValidationError, len(error.(validator.ValidationErrors)))

		for i, fieldError := range error.(validator.ValidationErrors) {
			//println(fieldError.Value().(int))
			validationOut[i] = ValidationError{fieldError.Field(), msgForTag(fieldError)}
		}

		for _, apiError := range validationOut {
			fmt.Printf("%s: %s\n", apiError.Field, apiError.Message)
		}
		return

	}

	var bucketName string
	var renderId string

	output, ok := response.(map[string]interface{})
	if !ok {

		log.Fatal("%s %s", "invalid response format", err)
	}

	for key, value := range output {
		switch key {
		case "bucketName":
			bucketName, _ = value.(string)
		case "renderId":
			renderId, _ = value.(string)

		}
	}

	fmt.Printf("bucketName: %s\nRenderId: %s\n", bucketName, renderId)

}


```

## Reference applications

 Reference projects are available:

- Ensure that [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) is already deployed on your AWS Account.


## Checking progress

For retrieving the progress of a Lambda render, you need to send another request to the Lambda function. Currently we do not have instructions for it, as a reference you may see [here](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-render-progress.ts) for the payload that is being sent by the TypeScript SDK.

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Permissions](/docs/lambda/permissions)
