import { Router, type IRouter } from "express";
import healthRouter from "./health";
import diaryRouter from "./diary";
import openaiChatRouter from "./openai-chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(diaryRouter);
router.use(openaiChatRouter);

export default router;
