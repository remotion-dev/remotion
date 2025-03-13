package lambda_go_sdk

import (
	"log"

	"github.com/go-playground/validator/v10"
)

func constructRenderInternals(options *RemotionOptions) (*renderInternalOptions, error) {

	inputProps, serializeError := serializeInputProps(options.InputProps, options.Region, "video-or-audio", options.ForceBucketName)

	if serializeError != nil {
		log.Fatal("Error in serializing input props", serializeError)
	}
	validate := validator.New()
	validationErrors := validate.Struct(options)
	if validationErrors != nil {

		return nil, validationErrors
	}

	jpegQuality := 80
	if options.JpegQuality != 0 {
		jpegQuality = options.JpegQuality
	}

	internalParams := renderInternalOptions{
		ServeUrl:                       options.ServeUrl,
		InputProps:                     inputProps,
		Composition:                    options.Composition,
		Version:                        VERSION,
		FrameRange:                     options.FrameRange,
		OutName:                        options.OutName,
		AudioBitrate:                   options.AudioBitrate,
		VideoBitrate:                   options.VideoBitrate,
		Webhook:                        options.Webhook,
		ForceHeight:                    options.ForceHeight,
		OffthreadVideoCacheSizeInBytes: options.OffthreadVideoCacheSizeInBytes,
		OffthreadVideoThreads:          options.OffthreadVideoThreads,
		X264Preset:                     options.X264Preset,
		ForceWidth:                     options.ForceWidth,
		ApiKey:                         options.ApiKey,
		BucketName:                     options.BucketName,
		AudioCodec:                     options.AudioCodec,
		ForceBucketName:                options.ForceBucketName,
		RendererFunctionName:           &options.RendererFunctionName,
		DeleteAfter:                    options.DeleteAfter,
		Type:                           "start",
		JpegQuality:                    jpegQuality,
	}

	internalParams.Muted = options.Muted
	internalParams.PreferLossless = options.PreferLossless
	internalParams.Overwrite = options.Overwrite

	if options.RendererFunctionName == "" {
		internalParams.RendererFunctionName = nil
	}
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
		internalParams.Crf = nil
	} else {
		internalParams.Crf = options.Crf
	}
	if options.Privacy == "" {
		internalParams.Privacy = "public"
	} else {
		internalParams.Privacy = options.Privacy
	}
	if options.ColorSpace == "" {
		internalParams.ColorSpace = nil
	} else {
		internalParams.ColorSpace = options.ColorSpace
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

	if options.Codec == "" {
		internalParams.Codec = "h264"
	} else {
		internalParams.Codec = options.Codec
	}

	if options.MaxRetries == 0 {
		internalParams.MaxRetries = 1
	} else {
		internalParams.MaxRetries = options.MaxRetries
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

	if options.DownloadBehavior == nil {
		internalParams.DownloadBehavior = map[string]interface{}{
			"type": "play-in-browser",
		}
	} else {
		internalParams.DownloadBehavior = options.DownloadBehavior
	}
	if options.ChromiumOptions == nil {
		internalParams.ChromiumOptions = map[string]interface{}{}
	} else {
		internalParams.ChromiumOptions = options.ChromiumOptions
	}
	if options.EnvVariables == nil {
		internalParams.EnvVariables = map[string]interface{}{}
	} else {
		internalParams.EnvVariables = options.EnvVariables
	}
	if options.Metadata == nil {
		internalParams.Metadata = map[string]interface{}{}
	} else {
		internalParams.Metadata = options.Metadata
	}

	return &internalParams, nil
}

func constructGetProgressInternals(options *RenderConfig) (*renderProgressInternalConfig, error) {

	validate := validator.New()
	validationErrors := validate.Struct(options)
	if validationErrors != nil {

		return nil, validationErrors
	}

	logLevel := "info"
	if options.LogLevel != "" {
		logLevel = options.LogLevel
	}

	internalParams := renderProgressInternalConfig{
		RenderId:   options.RenderId,
		BucketName: options.BucketName,
		LogLevel:   logLevel,
		Type:       "status",
		Version:    VERSION,
	}

	return &internalParams, nil
}
