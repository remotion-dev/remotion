package goclient

import (
	"log"

	"github.com/go-playground/validator/v10"
)

func constructInternals(options *RemotionOptions) (*internalOptions, error) {

	inputProps, serializeError := serializeInputProps(options.InputProps, options.Region, "video-or-audio", options.ForceBucketName)

	if serializeError != nil {
		log.Fatal("Error in serializing input props", serializeError)
	}
	validate := validator.New()
	validationErrors := validate.Struct(options)
	if validationErrors != nil {

		return nil, validationErrors
	}

	internalParams := internalOptions{
		ServeUrl:        options.ServeUrl,
		InputProps:      inputProps,
		Composition:     options.Composition,
		Region:          options.Region,
		Type:            "start",
		Version:         options.Version,
		FrameRange:      options.FrameRange,
		OutName:         options.OutName,
		AudioBitrate:    options.AudioBitrate,
		VideoBitrate:    options.VideoBitrate,
		Webhook:         options.Webhook,
		ForceHeight:     options.ForceHeight,
		ForceWidth:      options.ForceWidth,
		BucketName:      options.BucketName,
		AudioCodec:      options.AudioCodec,
		ForceBucketName: options.ForceBucketName,
	}

	internalParams.Muted = options.Muted
	internalParams.Overwrite = options.Overwrite
	if options.Codec == "" {
		internalParams.Codec = "h264"
	} else {
		internalParams.Codec = options.Codec
	}
	if options.EveryNthFrame == 0 {
		internalParams.EveryNthFrame = 1
	} else {
		internalParams.EveryNthFrame = options.EveryNthFrame
	}

	if options.ImageFormat == "" {
		internalParams.ImageFormat = "jpeg"
	} else {
		internalParams.ImageFormat = options.ImageFormat
	}
	if options.Crf == 0 {
		internalParams.Crf = 1
	} else {
		internalParams.Crf = options.Crf
	}
	if options.Privacy == "" {
		internalParams.Privacy = "public"
	} else {
		internalParams.Privacy = options.Privacy
	}
	if options.LogLevel == "" {
		internalParams.LogLevel = "info"
	} else {
		internalParams.LogLevel = options.LogLevel
	}

	if options.Scale == 0 {
		internalParams.Scale = 1
	} else {
		internalParams.Scale = options.Scale
	}

	if options.Crf == 0 {
		internalParams.Crf = 1
	} else {
		internalParams.Crf = options.Crf
	}

	if options.Codec == "" {
		internalParams.Codec = "h264"
	} else {
		internalParams.Codec = options.Codec
	}

	if options.MaxRetries == 0 {
		internalParams.MaxRetries = 3
	} else {
		internalParams.MaxRetries = options.MaxRetries
	}

	if options.Quality == 0 {
		internalParams.Quality = 80
	} else {
		internalParams.Quality = options.Quality
	}

	if options.Scale == 0 {
		internalParams.Scale = 1
	} else {
		internalParams.Scale = options.Scale
	}

	if options.ConcurrencyPerLambda == 0 {
		internalParams.ConcurrencyPerLambda = 1
	} else {
		internalParams.ConcurrencyPerLambda = options.ConcurrencyPerLambda
	}

	if options.TimeoutInMilliseconds == 0 {
		internalParams.TimeoutInMilliseconds = 30000
	} else {
		internalParams.TimeoutInMilliseconds = options.TimeoutInMilliseconds
	}
	internalParams.NumberOfGifLoops = options.NumberOfGifLoops

	if options.Gl == "" {
		internalParams.Gl = "swangle"
	} else {
		internalParams.Gl = options.Gl
	}

	if &options.DownloadBehavior == nil {
		internalParams.DownloadBehavior = map[string]interface{}{
			"type": "play-in-browser",
		}
	} else {
		internalParams.DownloadBehavior = options.DownloadBehavior
	}
	if &options.ChromiumOptions == nil {
		internalParams.ChromiumOptions = []interface{}{}
	} else {
		internalParams.ChromiumOptions = options.ChromiumOptions
	}

	if &options.EnvVariables == nil {
		internalParams.EnvVariables = []interface{}{}
	} else {
		internalParams.EnvVariables = options.EnvVariables
	}

	return &internalParams, nil
}
