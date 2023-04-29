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
	case "email":
		return "Invalid email"
	}
	return fe.Error() // default error
}

func main() {

	// Load the environment variables from the .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	serveUrl := os.Getenv("REMOTION_APP_SERVER_URL")
	functionName := os.Getenv("REMOTION_APP_FUNCTION_NAME")
	region := os.Getenv("REMOTION_APP_REGION")

	input := goclient.RemotionOptions{
		ServeUrl:     serveUrl,
		FunctionName: functionName,
		Region:       region,
		InputProps: map[string]interface{}{
			"data": "Let's play",
		},
		Composition:           "main",
		Type:                  "start",
		Codec:                 "h264",
		Version:               "3.3.78",
		ImageFormat:           "jpeg",
		Crf:                   1,
		EnvVariables:          []interface{}{},
		Quality:               101,
		MaxRetries:            1,
		Privacy:               "public",
		LogLevel:              "info",
		FrameRange:            nil,
		OutName:               nil,
		TimeoutInMilliseconds: 30000,
		ChromiumOptions:       []interface{}{},
		Scale:                 1,
		EveryNthFrame:         1,
		NumberOfGifLoops:      0,
		ConcurrencyPerLambda:  1,
		DownloadBehavior: map[string]interface{}{
			"type": "play-in-browser",
		},
		Muted:           false,
		Overwrite:       false,
		AudioBitrate:    nil,
		VideoBitrate:    nil,
		Webhook:         nil,
		ForceHeight:     nil,
		ForceWidth:      nil,
		BucketName:      nil,
		AudioCodec:      nil,
		ForceBucketName: nil,
	}
	response, error := goclient.RenderMedia(input)

	if error != nil {

		validationOut := make([]ValidationError, len(error.(validator.ValidationErrors)))

		for i, fieldError := range error.(validator.ValidationErrors) {
			validationOut[i] = ValidationError{fieldError.Field(), msgForTag(fieldError)}
		}

		for _, apiError := range validationOut {
			fmt.Printf("%s: %s\n", apiError.Param, apiError.Message)
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
