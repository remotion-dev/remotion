package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/remotion-dev/lambda_go_sdk"
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
		log.Printf("No .env file")
	}

	// Specify the URL to your Webpack bundle
	serveUrl := os.Getenv("REMOTION_APP_SERVE_URL")
	// Specify the function you would like to call
	functionName := os.Getenv("REMOTION_APP_FUNCTION_NAME")
	// Specify the region you deployed to, for example "us-east-1"
	region := os.Getenv("REMOTION_APP_REGION")

	// Set parameters for render
	renderInputRequest := lambda_go_sdk.RemotionOptions{
		ServeUrl:     serveUrl,
		FunctionName: functionName,
		Region:       region,
		// The data that composition will use
		InputProps: map[string]interface{}{
			"data": "Let's play",
		},
		Composition: "react-svg", // The composition to use

	}

	// Execute the render process
	renderResponse, renderError := lambda_go_sdk.RenderMediaOnLambda(renderInputRequest)

	// Check if there are validation errors
	if renderError != nil {
		// Try to assert the error as validator.ValidationErrors
		if validationErrs, ok := renderError.(validator.ValidationErrors); ok {
			validationOut := make([]ValidationError, len(validationErrs))

			for i, fieldError := range validationErrs {
				validationOut[i] = ValidationError{
					Field:   fieldError.Field(),
					Message: msgForTag(fieldError),
				}
			}

			// Print each formatted validation error
			for _, apiError := range validationOut {
				fmt.Printf("%s: %s\n", apiError.Field, apiError.Message)
			}
		} else {
			// If the type is not ValidationErrors, rethrow the error or handle it differently
			fmt.Printf("An error occurred: %s\n", renderError)
		}
		return
	}

	fmt.Print(renderResponse.RenderId)
	/// Get bucket information
	fmt.Printf("bucketName: %s\nRenderId: %s\n", renderResponse.RenderId, renderResponse.RenderId)
	// Render Progress request
	renderProgressInputRequest := lambda_go_sdk.RenderConfig{
		FunctionName: functionName,
		Region:       region,
		RenderId:     renderResponse.RenderId,
		BucketName:   renderResponse.BucketName,
		LogLevel:     "info",
	}

	// Keep checking progress until render is complete
	for {
		// Execute getting the render progress
		renderProgressResponse, renderProgressError := lambda_go_sdk.GetRenderProgress(renderProgressInputRequest)

		// Check if we have error
		if renderProgressError != nil {
			log.Fatalf("%s %s", "Invalid render progress response", renderProgressError)
		}

		if len(renderProgressResponse.Errors) > 0 {
			fmt.Printf("errors: %v\n", renderProgressResponse.Errors)
		}
		if renderProgressResponse.FatalErrorEncountered {
			log.Fatalf("%s %v", "Fatal error encountered", renderProgressResponse.Errors)
		}

		// Get the overall render progress
		fmt.Printf("overallprogress: %f\n", renderProgressResponse.OverallProgress)

		if renderProgressResponse.OverallProgress >= 1.0 {
			fmt.Printf("Render completed %s\n", *renderProgressResponse.OutputFile)
			break
		}

		// Wait a bit before checking again
		time.Sleep(1 * time.Second)
	}
}
