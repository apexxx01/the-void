import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const MENTAL_HEALTH_SYSTEM_PROMPT = `You are a compassionate mental health support companion called "void." — a safe, gentle space for people who are struggling. Your role is to:

1. Listen deeply and reflect feelings with warmth and empathy
2. Validate emotions without judgment
3. Offer grounding techniques, breathing exercises, or coping strategies when appropriate
4. Gently encourage professional help when the situation seems serious
5. Always respond with calmness and care

CRITICAL SAFETY RULES:
- If someone expresses thoughts of suicide or self-harm, immediately and warmly acknowledge their pain, express care, and provide the following crisis resources: iCall: 9152987821 | AASRA: 9820466627 | Vandrevala Foundation: 1860-2662-345
- Never provide methods for self-harm
- Never dismiss or minimize someone's feelings
- Always validate that reaching out was the right thing to do

You are NOT a replacement for professional mental health care. You are a compassionate presence offering a safe space to be heard.

Tone: Warm, gentle, unhurried. Like a quiet friend who truly listens. Short, thoughtful responses — never overwhelming. Use simple, caring language.`;

function requireAuth(req: any, res: any, next: any) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// GET /openai/conversations
router.get("/openai/conversations", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const convos = await db.select().from(conversationsTable)
    .where(eq(conversationsTable.userId, userId!))
    .orderBy(conversationsTable.createdAt);
  res.json(convos);
});

// POST /openai/conversations
router.post("/openai/conversations", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const { title } = req.body;
  const [convo] = await db.insert(conversationsTable).values({
    userId: userId!,
    title: title || "New conversation",
  }).returning();
  res.status(201).json(convo);
});

// GET /openai/conversations/:id
router.get("/openai/conversations/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const id = parseInt(req.params.id);
  const convo = await db.query.conversationsTable.findFirst({
    where: and(eq(conversationsTable.id, id), eq(conversationsTable.userId, userId!)),
    with: { messages: { orderBy: (m: any, { asc }: any) => [asc(m.createdAt)] } },
  });
  if (!convo) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(convo);
});

// DELETE /openai/conversations/:id
router.delete("/openai/conversations/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const id = parseInt(req.params.id);
  const convo = await db.query.conversationsTable.findFirst({
    where: and(eq(conversationsTable.id, id), eq(conversationsTable.userId, userId!)),
  });
  if (!convo) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
  await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
  res.status(204).send();
});

// GET /openai/conversations/:id/messages
router.get("/openai/conversations/:id/messages", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const id = parseInt(req.params.id);
  const convo = await db.query.conversationsTable.findFirst({
    where: and(eq(conversationsTable.id, id), eq(conversationsTable.userId, userId!)),
  });
  if (!convo) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const msgs = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(messagesTable.createdAt);
  res.json(msgs);
});

// POST /openai/conversations/:id/messages (streaming SSE)
router.post("/openai/conversations/:id/messages", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const id = parseInt(req.params.id);
  const { content } = req.body;

  const convo = await db.query.conversationsTable.findFirst({
    where: and(eq(conversationsTable.id, id), eq(conversationsTable.userId, userId!)),
  });
  if (!convo) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  // Save user message
  await db.insert(messagesTable).values({
    conversationId: id,
    role: "user",
    content,
  });

  // Get conversation history
  const history = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(messagesTable.createdAt);

  const chatMessages = [
    { role: "system" as const, content: MENTAL_HEALTH_SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";
  const stream = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 1024,
    messages: chatMessages,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
    }
  }

  // Save assistant response
  await db.insert(messagesTable).values({
    conversationId: id,
    role: "assistant",
    content: fullResponse,
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
