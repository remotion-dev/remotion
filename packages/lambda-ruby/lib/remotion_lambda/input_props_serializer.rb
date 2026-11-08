module RemotionLambda
  # Uploads oversized input props to S3, mirroring the reference implementations
  # in the JavaScript, Go, Python and PHP SDKs: AWS Lambda rejects synchronous
  # invoke payloads over 256 KB, so props that exceed the inline limit are
  # written to the render bucket and passed to the render as a reference.
  module InputPropsSerializer
    INLINE_PAYLOAD_MARGIN = 5_000 + 1_024 # 5KB headroom for the payload + 1KB for webhook data
    MAX_STILL_INLINE_PAYLOAD_SIZE = 5_000_000 - INLINE_PAYLOAD_MARGIN
    MAX_VIDEO_INLINE_PAYLOAD_SIZE = 200_000 - INLINE_PAYLOAD_MARGIN
    INPUT_PROPS_KEY_TEMPLATE = 'input-props/%s.json'
    BUCKET_NAME_PREFIX = 'remotionlambda-'
    US_EAST_1 = 'us-east-1'

    def self.needs_upload?(payload_size, render_type)
      max_size = render_type == 'still' ? MAX_STILL_INLINE_PAYLOAD_SIZE : MAX_VIDEO_INLINE_PAYLOAD_SIZE
      payload_size > max_size
    end

    # Returns a new payload in which an oversized inline `inputProps` block is
    # replaced by an S3 reference. The caller's payload hash is left untouched,
    # so the same payload can be reused for multiple renders.
    def self.upload_oversized_input_props(payload, s3_client, render_type, region)
      input_props = payload[:inputProps]
      return payload unless input_props.is_a?(Hash) && input_props[:type] == 'payload'

      payload_string = input_props[:payload].to_s
      return payload unless needs_upload?(payload_string.bytesize, render_type)

      bucket_name = payload[:bucketName] || get_or_create_bucket(s3_client, region)
      hash = random_hash
      s3_client.put_object(
        bucket: bucket_name,
        key: format(INPUT_PROPS_KEY_TEMPLATE, hash),
        body: payload_string
      )

      warn(
        "Warning: The props are #{(payload_string.bytesize + 1023) / 1024}KB in size. " \
        'Uploading them to S3 to circumvent the AWS Lambda payload size limit, which may lead to slowdown.'
      )

      payload.merge(
        inputProps: {
          type: 'bucket-url',
          hash: hash,
          bucketName: bucket_name
        }
      )
    end

    # Mirrors getOrCreateBucket() in the Go SDK: reuse the single existing
    # Remotion bucket in the region, create one if none exists, and refuse to
    # guess when several exist. The Lambda runtime resolves the render bucket
    # the same way when the payload omits bucketName.
    def self.get_or_create_bucket(s3_client, region)
      buckets = s3_client.list_buckets.buckets.map(&:name).select do |name|
        name.start_with?(BUCKET_NAME_PREFIX) && bucket_in_region?(s3_client, name, region)
      end

      if buckets.size > 1
        raise ArgumentError,
              "You have multiple buckets (#{buckets.join(', ')}) in your S3 region (#{region}) starting with \"#{BUCKET_NAME_PREFIX}\". Please see https://remotion.dev/docs/lambda/multiple-buckets"
      end

      return buckets.first unless buckets.empty?

      bucket = "#{BUCKET_NAME_PREFIX}#{region.delete('-')}-#{random_hash}"
      options = {bucket: bucket}
      unless region == US_EAST_1
        options[:create_bucket_configuration] = {location_constraint: region}
      end
      s3_client.create_bucket(options)
      bucket
    end

    def self.bucket_in_region?(s3_client, bucket, region)
      location = s3_client.get_bucket_location(bucket: bucket).location_constraint
      location == region || (location.to_s.empty? && region == US_EAST_1)
    end

    def self.random_hash
      alphabet = ('a'..'z').to_a + ('0'..'9').to_a
      Array.new(10) { alphabet.sample }.join
    end
  end
end
