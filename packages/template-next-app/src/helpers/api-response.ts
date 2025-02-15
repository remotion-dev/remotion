import { NextResponse } from "next/server";
import { z, ZodType } from "zod";

export type ApiResponse<Res> =
  | {
      type: "error";
      message: string;
    }
  | {
      type: "success";
      data: Res;
    };

export const executeApi =
  <Res, Req extends ZodType>(
    schema: Req,
    handler: (req: Request, body: z.infer<Req>) => Promise<Res>,
  ) =>
  async (req: Request) => {
    try {
      const payload = await req.json();
      const parsed = schema.parse(payload);
      const data = await handler(req, parsed);
      return NextResponse.json({
        type: "success",
        data: data,
      });
    } catch (err) {
      return NextResponse.json(
        { type: "error", message: (err as Error).message },
        {
          status: 500,
        },
      );
    }
  };
