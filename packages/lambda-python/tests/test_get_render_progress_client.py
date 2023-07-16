from unittest import TestCase

from remotion_lambda_sdk.remotionclient import RemotionClient

# python -m pip install boto3


class TestRemotionClient(TestCase):
    def test_remotionprogress_construct_request(self):
        client = RemotionClient(region="us-east-1",
                                serve_url="testbed",
                                function_name="remotion-render")

        print(client.contruct_render_progress_request(
            render_id="abcdef",  bucket_name="remotion-render"))
