package lambda_go_sdk

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
)

const bucketNamePrefix = "remotionlambda-"
const regionUsEast1 = "us-east-1"

type bucketLocationGetter interface {
	GetBucketLocation(context.Context, *s3.GetBucketLocationInput, ...func(*s3.Options)) (*s3.GetBucketLocationOutput, error)
}

type objectUploader interface {
	PutObject(context.Context, *s3.PutObjectInput, ...func(*s3.Options)) (*s3.PutObjectOutput, error)
}

// hashPayload returns the SHA256 hex digest used as the input-props object name.
func hashPayload(payload string) string {
	sum := sha256.Sum256([]byte(payload))
	return hex.EncodeToString(sum[:])
}

// randomHash returns a 10 character [a-z0-9] string used as a bucket suffix.
func randomHash() (string, error) {
	const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, 10)
	for i := range b {
		index, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		if err != nil {
			return "", fmt.Errorf("could not generate random hash: %w", err)
		}
		b[i] = alphabet[index.Int64()]
	}
	return string(b), nil
}

// makeBucketName mirrors the JS SDK bucket naming convention.
func makeBucketName(region string) (string, error) {
	suffix, err := randomHash()
	if err != nil {
		return "", err
	}
	return bucketNamePrefix + strings.ReplaceAll(region, "-", "") + "-" + suffix, nil
}

func inputPropsKey(hash string) string {
	return fmt.Sprintf("input-props/%s.json", hash)
}

// newS3Client creates an S3 client using the same shared config resolution as
// the Lambda client in invocations.go.
func newS3Client(region string, forcePathStyle bool) (*s3.Client, error) {
	awsConfig, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithRegion(region),
	)
	if err != nil {
		return nil, fmt.Errorf("could not load AWS config: %w", err)
	}
	return s3.NewFromConfig(awsConfig, func(options *s3.Options) {
		options.UsePathStyle = forcePathStyle
	}), nil
}

// isBucketInRegion reports whether the given bucket lives in region.
func isBucketInRegion(svc bucketLocationGetter, bucket string, region string) (bool, error) {
	out, err := svc.GetBucketLocation(context.TODO(), &s3.GetBucketLocationInput{Bucket: new(bucket)})
	if err != nil {
		var awsErr smithy.APIError
		if errors.As(err, &awsErr) && awsErr.ErrorCode() == "NoSuchBucket" {
			return false, nil
		}
		return false, fmt.Errorf("could not get location of S3 bucket %q: %w", bucket, err)
	}
	location := string(out.LocationConstraint)
	return location == region || (location == "" && region == regionUsEast1), nil
}

// getRemotionBuckets lists the Remotion buckets that exist in region.
func getRemotionBuckets(svc *s3.Client, region string) ([]string, error) {
	out, err := svc.ListBuckets(context.TODO(), &s3.ListBucketsInput{})
	if err != nil {
		return nil, fmt.Errorf("could not list S3 buckets: %w", err)
	}
	buckets := []string{}
	for _, bucket := range out.Buckets {
		name := aws.ToString(bucket.Name)
		if !strings.HasPrefix(name, bucketNamePrefix) {
			continue
		}
		isInRegion, err := isBucketInRegion(svc, name, region)
		if err != nil {
			return nil, err
		}
		if isInRegion {
			buckets = append(buckets, name)
		}
	}
	return buckets, nil
}

// getOrCreateBucket returns the single existing Remotion bucket in the region,
// creating one if none exist. It errors if multiple candidate buckets exist.
func getOrCreateBucket(svc *s3.Client, region string) (string, error) {
	buckets, err := getRemotionBuckets(svc, region)
	if err != nil {
		return "", err
	}

	if len(buckets) > 1 {
		return "", fmt.Errorf(
			"you have multiple buckets (%s) in your S3 region (%s) starting with %q. Please see https://remotion.dev/docs/lambda/multiple-buckets",
			strings.Join(buckets, ", "), region, bucketNamePrefix,
		)
	}
	if len(buckets) == 1 {
		return buckets[0], nil
	}

	bucket, err := makeBucketName(region)
	if err != nil {
		return "", err
	}
	input := &s3.CreateBucketInput{Bucket: new(bucket)}
	if region != regionUsEast1 {
		input.CreateBucketConfiguration = &types.CreateBucketConfiguration{
			LocationConstraint: types.BucketLocationConstraint(region),
		}
	}
	if _, err := svc.CreateBucket(context.TODO(), input); err != nil {
		return "", fmt.Errorf("failed to create bucket: %w", err)
	}
	return bucket, nil
}

// uploadInputPropsToS3 writes the serialized props to S3 as private JSON.
func uploadInputPropsToS3(svc objectUploader, bucket string, key string, payload string) error {
	_, err := svc.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      new(bucket),
		Key:         new(key),
		Body:        strings.NewReader(payload),
		ContentType: new("application/json"),
	})
	if err != nil {
		return fmt.Errorf("failed to upload inputProps to S3: %w", err)
	}
	return nil
}
