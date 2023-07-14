from unittest import TestCase

from renderparams import RenderParams
from remotionclient import RemotionClient

# python -m pip install boto3


class TestRemotionClient(TestCase):
    def test_remotion_construct_request(self):
        access_key = 'your_access_key'
        secret_key = 'your_secret_key'
        region_name = 'ap-southeast-2'  # Replace with your desired region name
        function_name = 'your_lambda_function_name'
        payload = '{"key": "value"}'

        client = RemotionClient(region="us-east-1",
                                serve_url="testbed",)

        render_params = RenderParams(

            composition="remotion-render",
            data={
                'hi': 'there'
            },
        )  # Instantiate a RenderParams object
        # Pass the object to renderMediaOnLambda
        print(client.contruct_render_request(render_params))
        self.assertEqual(client.region, "us-east-1")
        self.assertIsNotNone(render_params)
        self.assertIsNotNone(render_params.data)
        self.assertTrue(True)
