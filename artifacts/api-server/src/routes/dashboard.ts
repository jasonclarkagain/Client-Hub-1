import { Router, type IRouter } from "express";
import { db, projectsTable, projectFilesTable, messagesTable } from "@workspace/db";
import { count, desc } from "drizzle-orm";
import {
  GetDashboardSummaryResponse,
  GetRecentActivityResponse,
  GetStatusBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [projects, files, messages] = await Promise.all([
    db.select().from(projectsTable),
    db.select({ count: count() }).from(projectFilesTable),
    db.select({ count: count() }).from(messagesTable),
  ]);

  const summary = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "in_progress").length,
    completedProjects: projects.filter((p) => p.status === "completed").length,
    pendingProjects: projects.filter((p) => p.status === "pending").length,
    totalFiles: files[0]?.count ?? 0,
    totalMessages: messages[0]?.count ?? 0,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const [recentProjects, recentFiles, recentMessages] = await Promise.all([
    db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt)).limit(5),
    db.select().from(projectFilesTable).orderBy(desc(projectFilesTable.uploadedAt)).limit(5),
    db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt)).limit(5),
  ]);

  const projectsById: Record<number, string> = {};
  recentProjects.forEach((p) => { projectsById[p.id] = p.title; });

  const allProjectIds = [
    ...recentFiles.map((f) => f.projectId),
    ...recentMessages.map((m) => m.projectId),
  ];

  if (allProjectIds.length > 0) {
    const allProjects = await db.select().from(projectsTable);
    allProjects.forEach((p) => { projectsById[p.id] = p.title; });
  }

  const activities = [
    ...recentProjects.map((p) => ({
      id: `project-${p.id}`,
      type: "project_created" as const,
      projectId: p.id,
      projectTitle: p.title,
      description: `New project request from ${p.clientName}`,
      createdAt: p.createdAt.toISOString(),
    })),
    ...recentFiles.map((f) => ({
      id: `file-${f.id}`,
      type: "file_uploaded" as const,
      projectId: f.projectId,
      projectTitle: projectsById[f.projectId] ?? "Unknown project",
      description: `File uploaded: ${f.filename}`,
      createdAt: f.uploadedAt.toISOString(),
    })),
    ...recentMessages.map((m) => ({
      id: `message-${m.id}`,
      type: "message_posted" as const,
      projectId: m.projectId,
      projectTitle: projectsById[m.projectId] ?? "Unknown project",
      description: `${m.authorName} posted a message`,
      createdAt: m.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  res.json(GetRecentActivityResponse.parse(activities));
});

router.get("/dashboard/status-breakdown", async (_req, res): Promise<void> => {
  const projects = await db.select({ status: projectsTable.status }).from(projectsTable);

  const counts: Record<string, number> = {};
  for (const p of projects) {
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  }

  const breakdown = Object.entries(counts).map(([status, count]) => ({ status, count }));

  res.json(GetStatusBreakdownResponse.parse(breakdown));
});

export default router;
