package goclient

type RemotionOptions struct {
	ServeUrl              string                 `json:"serveUrl" validate:"required"`
	FunctionName          string                 `json:"functionName" validate:"required"`
	Region                string                 `json:"region" validate:"required"`
	InputProps            interface{}            `json:"inputProps"`
	Composition           string                 `json:"composition" validate:"required"`
	Type                  string                 `json:"type"`
	Codec                 string                 `json:"codec"`
	Version               string                 `json:"version"`
	ImageFormat           string                 `json:"imageFormat"`
	Crf                   int                    `json:"crf"`
	EnvVariables          []interface{}          `json:"envVariables"`
	Quality               int                    `json:"quality" validate:"required,min=1,max=100"`
	MaxRetries            int                    `json:"maxRetries"`
	Privacy               string                 `json:"privacy"`
	LogLevel              string                 `json:"logLevel"`
	FrameRange            interface{}            `json:"frameRange"`
	OutName               interface{}            `json:"outName"`
	TimeoutInMilliseconds int                    `json:"timeoutInMilliseconds"`
	ChromiumOptions       []interface{}          `json:"chromiumOptions"`
	Scale                 int                    `json:"scale"`
	EveryNthFrame         int                    `json:"everyNthFrame"`
	NumberOfGifLoops      int                    `json:"numberOfGifLoops"`
	ConcurrencyPerLambda  int                    `json:"concurrencyPerLambda"`
	DownloadBehavior      map[string]interface{} `json:"downloadBehavior"`
	Muted                 bool                   `json:"muted"`
	Overwrite             bool                   `json:"overwrite"`
	AudioBitrate          interface{}            `json:"audioBitrate"`
	VideoBitrate          interface{}            `json:"videoBitrate"`
	Webhook               interface{}            `json:"webhook"`
	ForceHeight           interface{}            `json:"forceHeight"`
	ForceWidth            interface{}            `json:"forceWidth"`
	BucketName            interface{}            `json:"bucketName"`
	AudioCodec            interface{}            `json:"audioCodec"`
	ForceBucketName       *string                `json:"forceBucketName"`
}

type internalOptions struct {
	ServeUrl              string      `json:"serveUrl"`
	FunctionName          string      `json:"functionName"`
	Region                string      `json:"region"`
	InputProps            interface{} `json:"inputProps"`
	Composition           string      `json:"composition"`
	Type                  string      `json:"type"`
	Codec                 string      `json:"codec"`
	Version               string      `json:"version"`
	ImageFormat           string      `json:"imageFormat"`
	Crf                   int
	EnvVariables          []interface{}
	Quality               int
	MaxRetries            int                    `json:"maxRetries"`
	Privacy               string                 `json:"privacy"`
	LogLevel              string                 `json:"logLevel"`
	FrameRange            interface{}            `json:"frameRange"`
	OutName               interface{}            `json:"outName"`
	TimeoutInMilliseconds int                    `json:"timeoutInMilliseconds"`
	ChromiumOptions       []interface{}          `json:"chromiumOptions"`
	Scale                 int                    `json:"scale"`
	EveryNthFrame         int                    `json:"everyNthFrame"`
	NumberOfGifLoops      int                    `json:"numberOfGifLoops"`
	ConcurrencyPerLambda  int                    `json:"concurrencyPerLambda"`
	DownloadBehavior      map[string]interface{} `json:"downloadBehavior"`
	Muted                 bool                   `json:"muted"`
	Overwrite             bool                   `json:"overwrite"`
	AudioBitrate          interface{}            `json:"audioBitrate"`
	VideoBitrate          interface{}            `json:"videoBitrate"`
	Webhook               interface{}            `json:"webhook"`
	ForceHeight           interface{}            `json:"forceHeight"`
	ForceWidth            interface{}            `json:"forceWidth"`
	BucketName            interface{}            `json:"bucketName"`
	AudioCodec            interface{}            `json:"audioCodec"`
	ForceBucketName       *string                `json:"forceBucketName"`
}

type RemotionRenderResponse struct {
	RenderId          string `json:"renderId"`
	BucketName        string `json:"bucketName"`
	CloudWatchLogs    string `json:"cloudWatchLogs"`
	FolderInS3Console string `json:"folderInS3Console"`
}
