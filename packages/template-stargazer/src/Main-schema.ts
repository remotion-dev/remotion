import { z } from "zod";

const mainSchema = z.object({
  repoOrg: z.string(),
  repoName: z.string(),
  starCount: z.number().step(1),
  duration: z.number().step(1),
});

