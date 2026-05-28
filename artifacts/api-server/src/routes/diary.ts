import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { diaryEntriesTable, diaryUsersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

async function verifyDiaryPw(userId: string, password: string): Promise<boolean> {
  const user = await db.query.diaryUsersTable.findFirst({
    where: eq(diaryUsersTable.userId, userId),
  });
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

function encrypt(text: string, password: string): string {
  return CryptoJS.AES.encrypt(text, password).toString();
}

function decrypt(cipherText: string, password: string): string {
  const bytes = CryptoJS.AES.decrypt(cipherText, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// GET /diary/has-password
router.get("/diary/has-password", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.query.diaryUsersTable.findFirst({
    where: eq(diaryUsersTable.userId, userId!),
  });
  res.json({ hasPassword: !!user });
});

// POST /diary/setup-password
router.post("/diary/setup-password", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const { password } = req.body;
  if (!password || password.length < 4) {
    res.status(400).json({ error: "Password must be at least 4 characters" });
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  const existing = await db.query.diaryUsersTable.findFirst({
    where: eq(diaryUsersTable.userId, userId!),
  });
  if (existing) {
    await db.update(diaryUsersTable)
      .set({ passwordHash: hash })
      .where(eq(diaryUsersTable.userId, userId!));
  } else {
    await db.insert(diaryUsersTable).values({ userId: userId!, passwordHash: hash });
  }
  res.json({ valid: true });
});

// POST /diary/verify-password
router.post("/diary/verify-password", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const { password } = req.body;
  const valid = await verifyDiaryPw(userId!, password);
  res.json({ valid });
});

// GET /diary/entries
router.get("/diary/entries", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const entries = await db.select({
    id: diaryEntriesTable.id,
    title: diaryEntriesTable.title,
    mood: diaryEntriesTable.mood,
    createdAt: diaryEntriesTable.createdAt,
    updatedAt: diaryEntriesTable.updatedAt,
  }).from(diaryEntriesTable)
    .where(eq(diaryEntriesTable.userId, userId!))
    .orderBy(diaryEntriesTable.createdAt);
  res.json(entries);
});

// POST /diary/entries
router.post("/diary/entries", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const { title, content, mood, diaryPassword } = req.body;
  if (!diaryPassword) {
    res.status(401).json({ error: "Diary password required" });
    return;
  }
  const valid = await verifyDiaryPw(userId!, diaryPassword);
  if (!valid) {
    res.status(401).json({ error: "Wrong diary password" });
    return;
  }
  const encryptedContent = encrypt(content, diaryPassword);
  const [entry] = await db.insert(diaryEntriesTable).values({
    userId: userId!,
    title,
    encryptedContent,
    mood: mood ?? null,
  }).returning({
    id: diaryEntriesTable.id,
    title: diaryEntriesTable.title,
    mood: diaryEntriesTable.mood,
    createdAt: diaryEntriesTable.createdAt,
    updatedAt: diaryEntriesTable.updatedAt,
  });
  res.status(201).json(entry);
});

// GET /diary/entries/:id
router.get("/diary/entries/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const id = parseInt(req.params.id);
  const diaryPassword = req.headers["x-diary-password"] as string;
  if (!diaryPassword) {
    res.status(401).json({ error: "Diary password required" });
    return;
  }
  const valid = await verifyDiaryPw(userId!, diaryPassword);
  if (!valid) {
    res.status(401).json({ error: "Wrong diary password" });
    return;
  }
  const entry = await db.query.diaryEntriesTable.findFirst({
    where: and(eq(diaryEntriesTable.id, id), eq(diaryEntriesTable.userId, userId!)),
  });
  if (!entry) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const content = decrypt(entry.encryptedContent, diaryPassword);
  res.json({
    id: entry.id,
    title: entry.title,
    content,
    mood: entry.mood,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  });
});

// PATCH /diary/entries/:id
router.patch("/diary/entries/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const id = parseInt(req.params.id);
  const diaryPassword = req.headers["x-diary-password"] as string;
  if (!diaryPassword) {
    res.status(401).json({ error: "Diary password required" });
    return;
  }
  const valid = await verifyDiaryPw(userId!, diaryPassword);
  if (!valid) {
    res.status(401).json({ error: "Wrong diary password" });
    return;
  }
  const existing = await db.query.diaryEntriesTable.findFirst({
    where: and(eq(diaryEntriesTable.id, id), eq(diaryEntriesTable.userId, userId!)),
  });
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const { title, content, mood } = req.body;
  const updates: Partial<typeof diaryEntriesTable.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.encryptedContent = encrypt(content, diaryPassword);
  if (mood !== undefined) updates.mood = mood;
  const [updated] = await db.update(diaryEntriesTable)
    .set(updates)
    .where(and(eq(diaryEntriesTable.id, id), eq(diaryEntriesTable.userId, userId!)))
    .returning({
      id: diaryEntriesTable.id,
      title: diaryEntriesTable.title,
      mood: diaryEntriesTable.mood,
      createdAt: diaryEntriesTable.createdAt,
      updatedAt: diaryEntriesTable.updatedAt,
    });
  res.json(updated);
});

// DELETE /diary/entries/:id
router.delete("/diary/entries/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const id = parseInt(req.params.id);
  const diaryPassword = req.headers["x-diary-password"] as string;
  if (!diaryPassword) {
    res.status(401).json({ error: "Diary password required" });
    return;
  }
  const valid = await verifyDiaryPw(userId!, diaryPassword);
  if (!valid) {
    res.status(401).json({ error: "Wrong diary password" });
    return;
  }
  const existing = await db.query.diaryEntriesTable.findFirst({
    where: and(eq(diaryEntriesTable.id, id), eq(diaryEntriesTable.userId, userId!)),
  });
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(diaryEntriesTable).where(
    and(eq(diaryEntriesTable.id, id), eq(diaryEntriesTable.userId, userId!))
  );
  res.status(204).send();
});

export default router;
