import { z } from "zod/mini";

export const ClaudeSettingsSchema = z.object({
  permissions: z.optional(
    z.object({
      deny: z.optional(z.array(z.string())),
    }),
  ),
});

export type ClaudeSettings = z.infer<typeof ClaudeSettingsSchema>;
