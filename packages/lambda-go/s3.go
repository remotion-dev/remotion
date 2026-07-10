package lambda_go_sdk

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

const bucketNamePrefix = "remotionlambda-"
const regionUsEast1 = "us-east-1"

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
func newS3Client(region string, forcePathStyle bool) *s3.S3 {
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config:            aws.Config{Region: aws.String(region)},
		SharedConfigState: session.SharedConfigEnable,
	}))
	return s3.New(sess, &aws.Config{S3ForcePathStyle: aws.Bool(forcePathStyle)})
}

// isBucketInRegion reports whether the given bucket lives in region.
func isBucketInRegion(svc *s3.S3, bucket string, region string) (bool, error) {
	out, err := svc.GetBucketLocation(&s3.GetBucketLocationInput{Bucket: aws.String(bucket)})
	if err != nil {
		if awsErr, ok := err.(awserr.Error); ok && awsErr.Code() == s3.ErrCodeNoSuchBucket {
			return false, nil
		}
		return false, fmt.Errorf("could not get location of S3 bucket %q: %w", bucket, err)
	}
	location := aws.StringValue(out.LocationConstraint)
	return location == region || (location == "" && region == regionUsEast1), nil
}

// getRemotionBuckets lists the Remotion buckets that exist in region.
func getRemotionBuckets(svc *s3.S3, region string) ([]string, error) {
	out, err := svc.ListBuckets(&s3.ListBucketsInput{})
	if err != nil {
		return nil, fmt.Errorf("could not list S3 buckets: %w", err)
	}
	buckets := []string{}
	for _, bucket := range out.Buckets {
		name := aws.StringValue(bucket.Name)
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
func getOrCreateBucket(svc *s3.S3, region string) (string, error) {
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
	input := &s3.CreateBucketInput{Bucket: aws.String(bucket)}
	if region != regionUsEast1 {
		input.CreateBucketConfiguration = &s3.CreateBucketConfiguration{
			LocationConstraint: aws.String(region),
		}
	}
	if _, err := svc.CreateBucket(input); err != nil {
		return "", fmt.Errorf("failed to create bucket: %w", err)
	}
	return bucket, nil
}

// uploadInputPropsToS3 writes the serialized props to S3 as private JSON.
func uploadInputPropsToS3(svc *s3.S3, bucket string, key string, payload string) error {
	_, err := svc.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		Body:        strings.NewReader(payload),
		ContentType: aws.String("application/json"),
	})
	if err != nil {
		return fmt.Errorf("failed to upload inputProps to S3: %w", err)
	}
	return nil
}
