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
		ServeUrl:         options.ServeUrl,
		InputProps:       inputProps,
		Composition:      options.Composition,
		Region:           options.Region,
		Type:             "start",
		Version:          options.Version,
		FrameRange:       options.FrameRange,
		OutName:          options.OutName,
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

	/**
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

	**/
	/*
		Default values
		TODO: Validation for values
	*/

	if &options.Codec == nil || options.Codec == "" {
		internalParams.Codec = "h264"
	}

	if &options.EveryNthFrame == nil || options.EveryNthFrame == 0 {
		internalParams.EveryNthFrame = 1
	}

	if &options.ImageFormat == nil || options.ImageFormat == "" {
		internalParams.ImageFormat = "jpeg"
	}
	if &options.Crf == nil || options.Crf == 0 {
		internalParams.Crf = 1
	}
	if &options.Privacy == nil || options.Privacy == "" {
		internalParams.Privacy = "public"
	}
	if &options.Privacy == nil || options.Privacy == "" {
		internalParams.LogLevel = "info"
	}
	if &options.Scale == nil || options.Scale == 0 {
		internalParams.Scale = 1
	}
	if &options.Crf == nil || options.Crf == 0 {
		internalParams.Crf = 1
	}
	if &options.Codec == nil || options.Codec == "" {
		internalParams.Codec = "h264"
	}
	if &options.MaxRetries == nil || options.MaxRetries == 0 {
		internalParams.MaxRetries = 3
	}
	if &options.Quality == nil || options.Quality == 0 {
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
	if &options.ConcurrencyPerLambda == nil || options.ConcurrencyPerLambda == 0 {
		internalParams.ConcurrencyPerLambda = 1
	}
	if &options.TimeoutInMilliseconds == nil || options.TimeoutInMilliseconds == 0 {
		internalParams.TimeoutInMilliseconds = 300000
	}
	if &options.NumberOfGifLoops == nil || options.NumberOfGifLoops == 0 {
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

	if &options.Gl == nil || options.Gl == "" {
		internalParams.Gl = "swangle"
	}

	if &options.LogLevel == nil || options.LogLevel == "" {
		internalParams.LogLevel = "info"
	}

	return &internalParams, nil
}
