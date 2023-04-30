package goclient

import (
	"log"

	"github.com/go-playground/validator/v10"
)

func constructInternals(options RemotionOptions) (*internalOptions, error) {

	inputProps, serializeError := serializeInputProps(options.InputProps, options.Region, "video-or-audio", options.ForceBucketName)

	if serializeError != nil {
		log.Fatal("Error in serializing input props", serializeError)
	}
	validate := validator.New()
	validationErrors := validate.Struct(options)
	if validationErrors != nil {

		return nil, validationErrors
	}

	internalParams := &internalOptions{
		ServeUrl:         options.ServeUrl,
		InputProps:       inputProps,
		Composition:      options.Composition,
		Region:           options.Region,
		Type:             "start",
		Version:          options.Version,
		LogLevel:         options.LogLevel,
		FrameRange:       options.FrameRange,
		OutName:          options.OutName,
		EveryNthFrame:    options.EveryNthFrame,
		DownloadBehavior: options.DownloadBehavior,
		AudioBitrate:     options.AudioBitrate,
		VideoBitrate:     options.VideoBitrate,
		Webhook:          options.Webhook,
		ForceHeight:      options.ForceHeight,
		ForceWidth:       options.ForceWidth,
		BucketName:       options.BucketName,
		AudioCodec:       options.AudioCodec,
		ForceBucketName:  options.ForceBucketName,
	}

	/*
		Default values
		TODO: Validation for values
	*/

	if &options.Codec == nil {
		internalParams.Codec = "h264"
	}
	if &options.ImageFormat == nil {
		internalParams.ImageFormat = "jpeg"
	}
	if &options.Crf == nil {
		internalParams.Crf = 1
	}
	if &options.Privacy == nil {
		internalParams.Privacy = "public"
	}
	if &options.Privacy == nil {
		internalParams.LogLevel = "info"
	}
	if &options.Scale == nil {
		internalParams.Scale = 1
	}
	if &options.Crf == nil {
		internalParams.Crf = 1
	}
	if &options.Codec == nil {
		internalParams.Codec = "h264"
	}
	if &options.MaxRetries == nil {
		internalParams.MaxRetries = 3
	}
	if &options.Quality == nil {
		internalParams.Quality = 80
	}
	if &options.Scale == nil {
		internalParams.Scale = 1
	}
	if &options.Muted == nil {
		internalParams.Muted = false
	}
	if &options.Overwrite == nil {
		internalParams.Overwrite = false
	}
	if &options.ConcurrencyPerLambda == nil {
		internalParams.ConcurrencyPerLambda = 1
	}
	if &options.TimeoutInMilliseconds == nil {
		internalParams.TimeoutInMilliseconds = 30000
	}
	if &options.NumberOfGifLoops == nil {
		internalParams.NumberOfGifLoops = 0
	}
	if &options.DownloadBehavior == nil {
		internalParams.DownloadBehavior = map[string]interface{}{
			"type": "play-in-browser",
		}
	}
	if &options.ChromiumOptions == nil {
		internalParams.ChromiumOptions = []interface{}{}
	}

	if &options.EnvVariables == nil {
		internalParams.EnvVariables = []interface{}{}
	}

	return internalParams, nil
}
