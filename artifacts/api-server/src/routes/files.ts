import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, projectFilesTable } from "@workspace/db";
import {
  ListProjectFilesParams,
  ListProjectFilesResponse,
  UploadProjectFileParams,
  UploadProjectFileBody,
  DeleteFileParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects/:id/files", async (req, res): Promise<void> => {
  const params = ListProjectFilesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const files = await db
    .select()
    .from(projectFilesTable)
    .where(eq(projectFilesTable.projectId, params.data.id));

  res.json(ListProjectFilesResponse.parse(
    files.map((f) => ({
      ...f,
      uploadedAt: f.uploadedAt.toISOString(),
    }))
  ));
});

router.post("/projects/:id/files", async (req, res): Promise<void> => {
  const params = UploadProjectFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UploadProjectFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [file] = await db
    .insert(projectFilesTable)
    .values({
      projectId: params.data.id,
      filename: parsed.data.filename,
      fileUrl: parsed.data.fileUrl,
      fileSize: parsed.data.fileSize,
      mimeType: parsed.data.mimeType,
    })
    .returning();

  res.status(201).json({
    ...file,
    uploadedAt: file.uploadedAt.toISOString(),
  });
});

router.delete("/files/:id", async (req, res): Promise<void> => {
  const params = DeleteFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [file] = await db
    .delete(projectFilesTable)
    .where(eq(projectFilesTable.id, params.data.id))
    .returning();

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
