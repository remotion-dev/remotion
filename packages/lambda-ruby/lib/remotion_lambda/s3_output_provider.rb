module RemotionLambda
  class S3OutputProvider
    def initialize(access_key_id:, endpoint:, region:, secret_access_key:)
      @region = region
      @access_key_id = access_key_id
      @secret_access_key = secret_access_key
      @endpoint = endpoint  
    end

    def to_json(*args)
      {
        region: @region,
        accessKeyId: @access_key_id,
        secretAccessKey: @secret_access_key,
        endpoint: @endpoint
      }.to_json(*args)
    end
  end
end
