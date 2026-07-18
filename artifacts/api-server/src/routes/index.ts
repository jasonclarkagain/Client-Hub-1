import { Router, type IRouter } from "express";
import { requireApiKey } from "../lib/auth";
import healthRouter from "./health";
import projectsRouter from "./projects";
import filesRouter from "./files";
import messagesRouter from "./messages";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);

router.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/projects") {
    next();
    return;
  }
  requireApiKey(req, res, next);
});

router.use(projectsRouter);
router.use(filesRouter);
router.use(messagesRouter);
router.use(dashboardRouter);

export default router;
