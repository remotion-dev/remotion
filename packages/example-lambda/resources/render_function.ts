import { Handler } from "aws-lambda";

export const handler: Handler = async (event: any = {}): Promise<any> => {
  //console.log(event);

  //return { statusCode: 201, body: "Hello world!" };

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "success",
    }),
  };
};
