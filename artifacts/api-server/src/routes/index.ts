import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import subscribeRouter from "./subscribe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(subscribeRouter);

export default router;
