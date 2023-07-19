from unittest import TestCase

from remotion_lambda.remotionclient import RemotionClient


class TestRemotionClient(TestCase):
    def test_remotionprogress_construct_request(self):
        client = RemotionClient(region="us-east-1",
                                serve_url="testbed",
                                function_name="remotion-render")

        print(client.construct_render_progress_request(
            render_id="abcdef",  bucket_name="remotion-render"))
