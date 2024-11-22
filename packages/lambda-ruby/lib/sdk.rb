require 'aws-sdk-lambda'
require 'json'
require 'logger'
require_relative 'version'

module RemotionLambda
  class Client
    attr_reader :bucket_name, :function_name, :serve_url

    def initialize(
      function_name:,
      serve_url:,
      region: ENV.fetch('AWS_REGION', ''),
      aws_profile: ENV.fetch('AWS_PROFILE', 'default')
    )
      @region = region
      @aws_profile = aws_profile
      @function_name = function_name
      @serve_url = serve_url
      @lambda_client = create_lambda_client
    end

    # Lambda methods
    def invoke(payload, function_name: @function_name)
      response = @lambda_client.invoke({
        function_name: function_name,
        payload: JSON.generate(payload)
      })

      JSON.parse(response.payload.string)
    rescue Aws::Lambda::Errors::ServiceError => e
      raise Remotion::Error, "Lambda invocation failed: #{e.message}"
    end

    def get_render_progress(render_id, bucket_name)
      payload = {
        "type" => "status",
        "renderId" => render_id,
        "bucketName" => bucket_name,
        "version" => VERSION,
      }

      body = invoke(payload)      
      raise "Failed to fetch progress: #{body['message']}" if body["type"] == "error"
      
      body
    end

    def get_render_media_on_lambda_payload(
      bucket_name: nil,
      codec:,
      audio_bitrate: nil,
      audio_codec: nil,
      color_space: nil,
      composition: nil,
      concurrency_per_lambda: 1,
      crf: nil,
      delete_after: nil,
      download_behavior: nil,
      encoding_buffer_size: nil,
      encoding_max_rate: nil,
      env_variables: {},
      every_nth_frame: 1,
      force_height: nil,
      force_path_style: false,
      force_width: nil,
      frame_range: nil,
      frames_per_lambda: nil,
      image_format: "jpeg",
      input_props: {},
      jpeg_quality: 80,
      log_level: "info",
      max_retries: 1,
      metadata: {},
      muted: false,
      number_of_gif_loops: 0,
      offthread_video_cache_size_in_bytes: nil,
      out_name: nil,
      overwrite: false,
      pixel_format: nil,
      prefer_lossless: false,
      privacy: "public",
      pro_res_profile: nil,
      renderer_function_name: nil,
      scale: 1,
      serve_url: "testbed",
      timeout_in_milliseconds: 30000,
      type: "start",
      video_bitrate: nil,
      webhook: nil,
      x264_preset: nil,
      chromium_options: {}
    )

    payload = {
        audioBitrate: audio_bitrate,
        audioCodec: audio_codec,
        codec: codec,
        colorSpace: color_space,
        composition: composition,
        concurrencyPerLambda: concurrency_per_lambda,
        chromiumOptions: chromium_options,
        crf: crf,
        deleteAfter: delete_after,
        downloadBehavior: download_behavior,
        encodingBufferSize: encoding_buffer_size,
        encodingMaxRate: encoding_max_rate,
        envVariables: env_variables,
        everyNthFrame: every_nth_frame,
        forceHeight: force_height,
        forcePathStyle: force_path_style,
        forceWidth: force_width,
        frameRange: frame_range,
        framesPerLambda: frames_per_lambda,
        imageFormat: image_format,
        inputProps: {
          type: "payload",
          payload: JSON.generate(input_props)
        },
        jpegQuality: jpeg_quality,
        logLevel: log_level,
        maxRetries: max_retries,
        metadata: metadata,
        muted: muted,
        numberOfGifLoops: number_of_gif_loops,
        offthreadVideoCacheSizeInBytes: offthread_video_cache_size_in_bytes,
        outName: out_name,
        overwrite: overwrite,
        pixelFormat: pixel_format,
        preferLossless: prefer_lossless,
        privacy: privacy,
        proResProfile: pro_res_profile,
        rendererFunctionName: renderer_function_name,
        scale: scale,
        serveUrl: serve_url,
        timeoutInMilliseconds: timeout_in_milliseconds,
        type: "start",
        version: VERSION,
        videoBitrate: video_bitrate,
        webhook: webhook,
        x264Preset: x264_preset,
        bucketName: bucket_name
      }
      payload
    end

    def get_render_progress_payload(
      render_id:,
      bucket_name:,
      force_path_style: false,
      log_level: 'info',
      s3_output_provider: nil
    )
      payload = {
        "type" => "status",
        "renderId" => render_id,
        "bucketName" => bucket_name,
        "version" => VERSION,
        "forcePathStyle" => force_path_style,
        "logLevel" => log_level,
        "s3OutputProvider" => s3_output_provider
      }

      payload
    end

    def create_lambda_client
      Aws::Lambda::Client.new(region: @region, credentials: aws_credentials)
    end

    def aws_credentials
      if @aws_profile
        Aws::SharedCredentials.new(profile_name: @aws_profile)
      else
        Aws::Credentials.new(ENV['AWS_ACCESS_KEY'], ENV['AWS_SECRET_KEY'])
      end
    end
  end
end 
