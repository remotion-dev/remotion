require 'aws-sdk-lambda'
require 'json'
require 'logger'
require_relative 'version'

module RemotionLambda
  class Client
    attr_reader :bucket_name, :function_name, :serve_url

    def initialize(
      region: ENV.fetch('AWS_REGION', ''),
      aws_profile: ENV.fetch('AWS_PROFILE', 'default')
    )
      @region = region
      @aws_profile = aws_profile
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

    def get_render_progress(payload)
      body = invoke(payload)      
      raise "Failed to fetch progress: #{body['message']}" if body["type"] == "error"
      
      body
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
