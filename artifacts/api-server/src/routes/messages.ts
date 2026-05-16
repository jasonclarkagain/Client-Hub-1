import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, messagesTable } from "@workspace/db";
import {
  ListProjectMessagesParams,
  ListProjectMessagesResponse,
  CreateMessageParams,
  CreateMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects/:id/messages", async (req, res): Promise<void> => {
  const params = ListProjectMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.projectId, params.data.id));

  res.json(ListProjectMessagesResponse.parse(
    messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    }))
  ));
});

router.post("/projects/:id/messages", async (req, res): Promise<void> => {
  const params = CreateMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [message] = await db
    .insert(messagesTable)
    .values({
      projectId: params.data.id,
      content: parsed.data.content,
      authorName: parsed.data.authorName,
      authorRole: parsed.data.authorRole as "client" | "designer",
    })
    .returning();

  res.status(201).json({
    ...message,
    createdAt: message.createdAt.toISOString(),
  });
});

export default router;
