import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);

export default router;
