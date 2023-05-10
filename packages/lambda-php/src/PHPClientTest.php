<?php

use Remotion\PHPClient;

class PHPClientTest extends PHPUnit\Framework\TestCase

{
    public function testClient()
    {
        //  $calculator = new Calculator();
        //$result = $calculator->add(2, 3);
        // $this->assertEquals(5, 5);
        $client = new PHPClient(
            "us-east-1",
            "react-svg",
            "remotion-render",
            null);
        print(json_encode(array(
            "data" => "",
        )));
    }
}
