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
