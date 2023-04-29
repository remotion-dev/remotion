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
		ServeUrl:              options.ServeUrl,
		InputProps:            inputProps,
		Composition:           options.Composition,
		Region:                options.Region,
		Type:                  options.Type,
		Codec:                 options.Codec,
		Version:               options.Version,
		ImageFormat:           options.ImageFormat,
		Crf:                   options.Crf,
		EnvVariables:          options.EnvVariables,
		Quality:               options.Quality,
		MaxRetries:            options.MaxRetries,
		Privacy:               options.Privacy,
		LogLevel:              options.LogLevel,
		FrameRange:            options.FrameRange,
		OutName:               options.OutName,
		TimeoutInMilliseconds: options.TimeoutInMilliseconds,
		ChromiumOptions:       options.ChromiumOptions,
		Scale:                 options.Scale,
		EveryNthFrame:         options.EveryNthFrame,
		NumberOfGifLoops:      options.NumberOfGifLoops,
		ConcurrencyPerLambda:  options.ConcurrencyPerLambda,
		DownloadBehavior:      options.DownloadBehavior,
		Muted:                 options.Muted,
		Overwrite:             options.Overwrite,
		AudioBitrate:          options.AudioBitrate,
		VideoBitrate:          options.VideoBitrate,
		Webhook:               options.Webhook,
		ForceHeight:           options.ForceHeight,
		ForceWidth:            options.ForceWidth,
		BucketName:            options.BucketName,
		AudioCodec:            options.AudioCodec,
		ForceBucketName:       options.ForceBucketName,
	}

	return internalParams, nil
}
