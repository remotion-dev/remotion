---
image: /generated/articles-docs-lambda-go.png
title: Triggering renders from Go
slug: /lambda/go
sidebar_label: Rendering from Go
crumb: "@remotion/lambda"
---

<ExperimentalBadge>
This feature is new. Please report any issues you encounter.
</ExperimentalBadge>

To trigger a Lambda render using Go, you can use the Remotion Lambda Go client. Note the following:

- You first need to [complete the Lambda setup](/docs/lambda/setup).
- Sending large input props (>200KB) is not supported with Go at the moment.
- Always match the version of the Go client with the version of the Lambda function you deployed. Otherwise, calls will fail due to version mismatch!

```go title="main.go"
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	// Match the version with the version of your deployed functions
	"github.com/remotion-dev/lambda_go_sdk/v3.3.98"
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

	// Set parameters for render
	renderInputRequest := remotionlambda.RemotionOptions{
		ServeUrl:     serveUrl,
		FunctionName: functionName,
		Region:       region,
		// The data that composition will use
		InputProps: map[string]interface{}{
			"data": "Let's play",
		},
		Composition: "main",   // The composition to use
	}

	// Execute the render process
	renderResponse, renderError := remotionlambda.RenderMediaOnLambda(renderInputRequest)

	// Check if there are validation errors
	if renderError != nil {

		validationOut := make([]ValidationError, len(renderError.(validator.ValidationErrors)))

		for i, fieldError := range renderError.(validator.ValidationErrors) {

			validationOut[i] = ValidationError{fieldError.Field(), msgForTag(fieldError)}
		}

		for _, apiError := range validationOut {
			fmt.Printf("%s: %s\n", apiError.Field, apiError.Message)
		}
		return

	}

	// Get bucket information
	fmt.Printf("Bucket name: %s, Render ID: %s\n", renderResponse.BucketName, renderResponse.RenderId)

	// Render Progress request
	renderProgressInputRequest := remotionlambda.RenderConfig{
		FunctionName: functionName,
		Region:       region,
		RenderId:     renderResponse.RenderId,
		BucketName:   renderResponse.BucketName,
	}
	// Execute getting the render progress
	renderProgressResponse, renderProgressError := remotionlambda.GetRenderProgress(renderProgressInputRequest)

	// Check if we have error
	if renderProgressError != nil {
		log.Fatal("%s %s", "Invalid render progress response", renderProgressError)
	}

	// Get the overall render progress
	fmt.Printf("Progress: %f", renderProgressResponse.OverallProgress)
}
```

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Permissions](/docs/lambda/permissions)
