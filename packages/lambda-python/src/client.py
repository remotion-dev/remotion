import boto3

from renderparams import RenderParams


class Client:
    def __init__(self, access_key=None, secret_key=None, region_name="ap-southeast-2", session=None):
        self.access_key = access_key
        self.secret_key = secret_key
        self.region_name = region_name
        self.session = session
        self.client = self.create_lambda_client()

    def create_lambda_client(self):
        if self.session:
            return self.session.client('lambda', region_name=self.region_name)
        elif self.access_key and self.secret_key:
            return boto3.client('lambda',
                                aws_access_key_id=self.access_key,
                                aws_secret_access_key=self.secret_key,
                                region_name=self.region_name)
        else:
            return boto3.client('lambda')

    def invoke_lambda(self, function_name, payload):
        try:
            response = self.client.invoke(
                FunctionName=function_name, Payload=payload)
            result = response['Payload'].read().decode('utf-8')
            print("Lambda function invoked successfully.")
            print("Response:", result)
        except Exception as e:
            print(f"Failed to invoke Lambda function: {str(e)}")

    def renderMediaOnLambda(self, render_params: RenderParams):
        print(render_params.serializeParams())
        # Function body


access_key = 'your_access_key'
secret_key = 'your_secret_key'
region_name = 'ap-southeast-2'  # Replace with your desired region name
function_name = 'your_lambda_function_name'
payload = '{"key": "value"}'

lambda_client = Client(access_key, secret_key, region_name)


render_params = RenderParams()  # Instantiate a RenderParams object
# Pass the object to renderMediaOnLambda
lambda_client.renderMediaOnLambda(render_params)
