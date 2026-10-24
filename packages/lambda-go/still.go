package lambda_go_sdk

import (
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"strings"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/go-playground/validator/v10"
)

// validStillImageFormatsOnLambda are the still image formats the Lambda function
// is able to render. PDF is excluded because of function size constraints.
var validStillImageFormatsOnLambda = []string{"png", "jpeg", "webp"}

type renderStillInternalOptions struct {
	Composition                    string                 `json:"composition" validate:"required"`
	ServeUrl                       string                 `json:"serveUrl" validate:"required"`
	InputProps                     interface{}            `json:"inputProps"`
	ImageFormat                    string                 `json:"imageFormat"`
	EnvVariables                   interface{}            `json:"envVariables"`
	JpegQuality                    int                    `json:"jpegQuality"`
	MaxRetries                     int                    `json:"maxRetries"`
	Frame                          int                    `json:"frame"`
	Privacy                        string                 `json:"privacy"`
	Attempt                        int                    `json:"attempt"`
	LogLevel                       string                 `json:"logLevel"`
	OutName                        interface{}            `json:"outName"`
	TimeoutInMilliseconds          int                    `json:"timeoutInMilliseconds"`
	ChromiumOptions                interface{}            `json:"chromiumOptions"`
	Scale                          float64                `json:"scale"`
	DownloadBehavior               map[string]interface{} `json:"downloadBehavior"`
	Version                        string                 `json:"version"`
	ForceHeight                    interface{}            `json:"forceHeight"`
	ForceWidth                     interface{}            `json:"forceWidth"`
	ForceFps                       interface{}            `json:"forceFps"`
	ForceDurationInFrames          interface{}            `json:"forceDurationInFrames"`
	BucketName                     interface{}            `json:"bucketName"`
	OffthreadVideoCacheSizeInBytes interface{}            `json:"offthreadVideoCacheSizeInBytes"`
	DeleteAfter                    *string                `json:"deleteAfter"`
	Type                           string                 `json:"type"`
	Streamed                       bool                   `json:"streamed"`
	ForcePathStyle                 bool                   `json:"forcePathStyle"`
	LicenseKey                     interface{}            `json:"licenseKey"`
	OffthreadVideoThreads          interface{}            `json:"offthreadVideoThreads"`
	MediaCacheSizeInBytes          interface{}            `json:"mediaCacheSizeInBytes"`
	StorageClass                   interface{}            `json:"storageClass"`
	IsProduction                   *bool                  `json:"isProduction"`
}

// RenderStillOnLambda renders a still image in a Lambda function and writes it to
// the specified output location. The rendered image is returned as a URL.
func RenderStillOnLambda(input RenderStillOptions) (*RemotionRenderStillResponse, error) {
	validate := validator.New()
	if err := validate.Struct(input); err != nil {
		return nil, err
	}

	internalParams, constructError := constructRenderStillInternals(&input)
	if constructError != nil {
		return nil, constructError
	}

	awsConfig, configError := awsconfig.LoadDefaultConfig(
		context.Background(),
		awsconfig.WithRegion(input.Region),
	)
	if configError != nil {
		return nil, fmt.Errorf("could not load AWS config: %w", configError)
	}
	svc := lambda.NewFromConfig(awsConfig)

	internalParamJsonObject, marshallingError := json.Marshal(internalParams)
	if marshallingError != nil {
		return nil, fmt.Errorf("could not serialize render parameters: %w", marshallingError)
	}

	invocationResult, invocationError := svc.Invoke(context.Background(), &lambda.InvokeInput{
		FunctionName: new(input.FunctionName),
		Payload:      internalParamJsonObject,
	})

	if invocationError != nil {
		return nil, fmt.Errorf("could not invoke Lambda function %q: %w", input.FunctionName, invocationError)
	}

	return parseStillResponse(invocationResult)
}

func parseStillResponse(output *lambda.InvokeOutput) (*RemotionRenderStillResponse, error) {
	// A Lambda function can fail while the invocation itself succeeds: a timeout,
	// an out-of-memory kill or an unhandled exception. AWS then sets FunctionError
	// and puts errorMessage/errorType in the payload instead of Remotion's own
	// `type` field, so this has to be checked before the payload is parsed.
	if output.FunctionError != nil {
		var details struct {
			ErrorMessage string `json:"errorMessage"`
			ErrorType    string `json:"errorType"`
		}

		if err := json.Unmarshal(output.Payload, &details); err == nil {
			switch {
			case details.ErrorMessage != "":
				return nil, fmt.Errorf("Lambda function returned error: %s %s", *output.FunctionError, details.ErrorMessage)
			case details.ErrorType != "":
				return nil, fmt.Errorf("Lambda function returned error: %s %s", *output.FunctionError, details.ErrorType)
			}
		}

		return nil, fmt.Errorf("Lambda function returned error: %s", *output.FunctionError)
	}

	if len(output.Payload) == 0 {
		return nil, fmt.Errorf("Lambda function returned no payload (status %d)", output.StatusCode)
	}

	var renderResponseOutput RemotionRenderStillResponse

	responseMarshallingError := json.Unmarshal(output.Payload, &renderResponseOutput)

	if responseMarshallingError != nil {
		return nil, fmt.Errorf("could not parse Lambda response: %w", responseMarshallingError)
	}

	switch renderResponseOutput.Type {
	case "error":
		return nil, fmt.Errorf("could not render still: %s", renderResponseOutput.Message)
	case "success":
		return &renderResponseOutput, nil
	default:
		return nil, fmt.Errorf("could not render still: Lambda returned a response of type %q, expected \"success\"", renderResponseOutput.Type)
	}
}

func constructRenderStillInternals(options *RenderStillOptions) (*renderStillInternalOptions, error) {
	validate := validator.New()
	validationErrors := validate.Struct(options)
	if validationErrors != nil {
		return nil, validationErrors
	}

	imageFormat := options.ImageFormat
	if imageFormat == "" {
		imageFormat = "png"
	}

	if !slices.Contains(validStillImageFormatsOnLambda, imageFormat) {
		return nil, fmt.Errorf("imageFormat must be one of %s", strings.Join(validStillImageFormatsOnLambda, ", "))
	}

	// Serialize (and, if too large, upload) inputProps only after validation so
	// that an invalid request does not trigger S3 side effects.
	inputProps, serializeError := serializeInputProps(options.InputProps, options.Region, "still", options.ForceBucketName, options.ForcePathStyle)

	if serializeError != nil {
		return nil, serializeError
	}

	jpegQuality := 80
	if options.JpegQuality != 0 {
		jpegQuality = options.JpegQuality
	}

	privacy := options.Privacy
	if privacy == "" {
		privacy = "public"
	}

	logLevel := options.LogLevel
	if logLevel == "" {
		logLevel = "info"
	}

	maxRetries := options.MaxRetries
	if maxRetries == 0 {
		maxRetries = 1
	}

	timeoutInMilliseconds := options.TimeoutInMilliseconds
	if timeoutInMilliseconds == 0 {
		timeoutInMilliseconds = 30000
	}

	scale := options.Scale
	if scale == 0 {
		scale = 1
	}

	// The Lambda function picks the bucket itself when no bucket name is given,
	// so an empty string must not be sent.
	var bucketName interface{}
	if options.ForceBucketName != "" {
		bucketName = options.ForceBucketName
	}

	var licenseKey interface{}
	if options.LicenseKey != nil {
		licenseKey = options.LicenseKey
	} else {
		licenseKey = options.ApiKey
	}

	internalParams := renderStillInternalOptions{
		Composition:                    options.Composition,
		ServeUrl:                       options.ServeUrl,
		InputProps:                     inputProps,
		ImageFormat:                    imageFormat,
		EnvVariables:                   options.EnvVariables,
		JpegQuality:                    jpegQuality,
		MaxRetries:                     maxRetries,
		Frame:                          options.Frame,
		Privacy:                        privacy,
		Attempt:                        1,
		LogLevel:                       logLevel,
		OutName:                        options.OutName,
		TimeoutInMilliseconds:          timeoutInMilliseconds,
		ChromiumOptions:                options.ChromiumOptions,
		Scale:                          scale,
		DownloadBehavior:               options.DownloadBehavior,
		Version:                        VERSION,
		ForceHeight:                    options.ForceHeight,
		ForceWidth:                     options.ForceWidth,
		ForceFps:                       options.ForceFps,
		ForceDurationInFrames:          options.ForceDurationInFrames,
		BucketName:                     bucketName,
		OffthreadVideoCacheSizeInBytes: options.OffthreadVideoCacheSizeInBytes,
		DeleteAfter:                    options.DeleteAfter,
		Type:                           "still",
		Streamed:                       false,
		ForcePathStyle:                 options.ForcePathStyle,
		LicenseKey:                     licenseKey,
		OffthreadVideoThreads:          options.OffthreadVideoThreads,
		MediaCacheSizeInBytes:          options.MediaCacheSizeInBytes,
		StorageClass:                   options.StorageClass,
		IsProduction:                   options.IsProduction,
	}

	if internalParams.EnvVariables == nil {
		internalParams.EnvVariables = map[string]interface{}{}
	}

	if internalParams.ChromiumOptions == nil {
		internalParams.ChromiumOptions = map[string]interface{}{}
	}

	if internalParams.DownloadBehavior == nil {
		internalParams.DownloadBehavior = map[string]interface{}{
			"type": "play-in-browser",
		}
	}

	return &internalParams, nil
}
