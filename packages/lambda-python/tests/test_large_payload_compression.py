import unittest
from unittest.mock import patch, MagicMock
from remotion_lambda.models import RenderMediaParams
from remotion_lambda.remotionclient import RemotionClient


class TestLargePayloadCompression(unittest.TestCase):
    
    def setUp(self):
        self.client = RemotionClient(
            region="us-east-1",
            serve_url="testbed",
            function_name="remotion-render",
            bucket_name="test-bucket"
        )
    
    def test_small_payload_uses_payload_format(self):
        """Test that small payloads use the payload format."""
        small_props = {'message': 'small'}
        result = self.client._serialize_input_props(small_props, 'video-or-audio')
        
        self.assertEqual(result['type'], 'payload')
        self.assertIn('payload', result)
        self.assertNotIn('hash', result)
        self.assertNotIn('bucketName', result)
    
    @patch('remotion_lambda.remotionclient.RemotionClient._upload_to_s3')
    @patch('remotion_lambda.remotionclient.RemotionClient._get_or_create_bucket')
    def test_large_payload_uses_bucket_format(self, mock_get_bucket, mock_upload):
        """Test that large payloads use the bucket-url format."""
        mock_get_bucket.return_value = 'test-bucket'
        
        # Create a large payload that exceeds the limit for video-or-audio (200KB - margin)
        large_data = 'x' * 200000  # 200KB of data
        large_props = {'data': large_data}
        
        result = self.client._serialize_input_props(large_props, 'video-or-audio')
        
        self.assertEqual(result['type'], 'bucket-url')
        self.assertIn('hash', result)
        self.assertIn('bucketName', result)
        self.assertEqual(result['bucketName'], 'test-bucket')
        
        # Verify S3 upload was called
        mock_upload.assert_called_once()
        
    def test_needs_upload_logic(self):
        """Test the logic for determining when upload is needed."""
        # Small payload should not need upload
        self.assertFalse(self.client._needs_upload(1000, 'video-or-audio'))
        self.assertFalse(self.client._needs_upload(1000, 'still'))
        
        # Large payload for video should need upload
        self.assertTrue(self.client._needs_upload(200000, 'video-or-audio'))
        
        # Large payload for still should need upload (over 5MB)
        self.assertTrue(self.client._needs_upload(5000000, 'still'))
        
        # Medium payload for still should not need upload
        self.assertFalse(self.client._needs_upload(1000000, 'still'))
    
    def test_hash_generation(self):
        """Test that hash generation is consistent."""
        payload = '{"test": "data"}'
        hash1 = self.client._generate_hash(payload)
        hash2 = self.client._generate_hash(payload)
        
        self.assertEqual(hash1, hash2)
        self.assertIsInstance(hash1, str)
        self.assertEqual(len(hash1), 64)  # SHA256 hex string length
    
    def test_input_props_key_generation(self):
        """Test S3 key generation for input props."""
        hash_value = 'test123'
        key = self.client._input_props_key(hash_value)
        self.assertEqual(key, 'input-props/test123.json')


if __name__ == '__main__':
    unittest.main()