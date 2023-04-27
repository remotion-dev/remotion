module goclient-example

go 1.20

replace github.com/remotion-dev/remotion/packages/goclient => ../goclient

require github.com/remotion-dev/remotion/packages/goclient v0.0.0-00010101000000-000000000000

require (
	github.com/aws/aws-sdk-go v1.44.249 // indirect
	github.com/jmespath/go-jmespath v0.4.0 // indirect
)
