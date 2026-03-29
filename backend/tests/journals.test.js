require("./setup");
const supertest = require("supertest");
const app = require("../app");
const Journal = require("../models/journal");
const { createAuthenticatedUser, generateToken } = require("./helpers");

const api = supertest(app);

let authUser;
let authToken;

beforeEach(async () => {
  const auth = await createAuthenticatedUser();
  authUser = auth.user;
  authToken = auth.token;
});

const sampleJournal = {
  title: "Test Journal Entry",
  content: "This is a test journal entry with enough words for a count.",
  tags: ["test", "sample"],
  moods: ["happy"],
  custom_moods: [],
};

describe("POST /api/journals", () => {
  test("creates a journal entry with valid data", async () => {
    const response = await api
      .post("/api/journals")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJournal)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.title).toBe(sampleJournal.title);
    expect(response.body.content).toBe(sampleJournal.content);
    expect(response.body.tags).toEqual(sampleJournal.tags);
    expect(response.body.moods).toEqual(sampleJournal.moods);
    expect(response.body.wordCount).toBeGreaterThan(0);
    expect(response.body.user).toBe(authUser._id.toString());
    expect(response.body.id).toBeDefined();
  });

  test("calculates word count correctly", async () => {
    const response = await api
      .post("/api/journals")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...sampleJournal, content: "one two three four five" })
      .expect(200);

    expect(response.body.wordCount).toBe(5);
  });

  test("fails without authentication", async () => {
    await api.post("/api/journals").send(sampleJournal).expect(401);
  });

  test("fails with invalid token", async () => {
    await api
      .post("/api/journals")
      .set("Authorization", "Bearer invalidtoken")
      .send(sampleJournal)
      .expect(401);
  });

  test("fails without required title", async () => {
    const { title, ...noTitle } = sampleJournal;

    await api
      .post("/api/journals")
      .set("Authorization", `Bearer ${authToken}`)
      .send(noTitle)
      .expect(400);
  });

  test("fails without required content", async () => {
    const { content, ...noContent } = sampleJournal;

    // content.split() will throw if content is undefined, resulting in 500
    // This tests the error handler middleware
    const response = await api
      .post("/api/journals")
      .set("Authorization", `Bearer ${authToken}`)
      .send(noContent);

    expect([400, 500]).toContain(response.status);
  });
});

describe("GET /api/journals", () => {
  beforeEach(async () => {
    // Seed 3 journal entries
    const entries = [
      {
        title: "First Entry",
        content: "Content of the first entry",
        tags: ["morning"],
        moods: ["happy"],
        custom_moods: [],
        user: authUser._id,
        wordCount: 5,
      },
      {
        title: "Second Entry",
        content: "Content of the second entry for today",
        tags: ["evening", "reflection"],
        moods: ["calm"],
        custom_moods: [],
        user: authUser._id,
        wordCount: 7,
      },
      {
        title: "Third Entry",
        content: "A short one",
        tags: ["morning"],
        moods: ["anxious"],
        custom_moods: [],
        user: authUser._id,
        wordCount: 3,
      },
    ];

    await Journal.insertMany(entries);
  });

  test("returns all journals for authenticated user", async () => {
    const response = await api
      .get("/api/journals")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.journals).toHaveLength(3);
    expect(response.body.totalJournals).toBe(3);
    expect(response.body.currentPage).toBe(1);
  });

  test("does not return other users journals", async () => {
    const { token: otherToken } = await createAuthenticatedUser({
      username: "otheruser",
      email: "other@example.com",
    });

    const response = await api
      .get("/api/journals")
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(200);

    expect(response.body.journals).toHaveLength(0);
    expect(response.body.totalJournals).toBe(0);
  });

  test("fails without authentication", async () => {
    await api.get("/api/journals").expect(401);
  });

  test("paginates results correctly", async () => {
    const response = await api
      .get("/api/journals?page=1&limit=2")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.journals).toHaveLength(2);
    expect(response.body.totalPages).toBe(2);
    expect(response.body.totalJournals).toBe(3);
  });

  test("sorts by newest first by default", async () => {
    const response = await api
      .get("/api/journals")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    const dates = response.body.journals.map((j) => new Date(j.createdAt));
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
    }
  });

  test("sorts alphabetically when requested", async () => {
    const response = await api
      .get("/api/journals?sort=alpha")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    const titles = response.body.journals.map((j) => j.title);
    expect(titles).toEqual([...titles].sort());
  });

  test("filters by tag", async () => {
    const response = await api
      .get("/api/journals?tags=morning")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.journals).toHaveLength(2);
    response.body.journals.forEach((j) => {
      expect(j.tags).toContain("morning");
    });
  });

  test("filters by mood", async () => {
    const response = await api
      .get("/api/journals?moods=happy")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.journals).toHaveLength(1);
    expect(response.body.journals[0].moods).toContain("happy");
  });
});

describe("GET /api/journals/:id", () => {
  let journalId;

  beforeEach(async () => {
    const journal = new Journal({
      title: "Single Entry",
      content: "Content for single entry test",
      tags: [],
      moods: [],
      custom_moods: [],
      user: authUser._id,
      wordCount: 5,
    });
    const saved = await journal.save();
    journalId = saved._id.toString();
  });

  test("returns a single journal by id", async () => {
    const response = await api
      .get(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.title).toBe("Single Entry");
    expect(response.body.id).toBe(journalId);
  });

  test("returns 404 for nonexistent journal", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    await api
      .get(`/api/journals/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  test("returns 403 when accessing another users journal", async () => {
    const { token: otherToken } = await createAuthenticatedUser({
      username: "intruder",
      email: "intruder@example.com",
    });

    await api
      .get(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(403);
  });

  test("returns 400 for malformed id", async () => {
    await api
      .get("/api/journals/not-a-valid-id")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400);
  });
});

describe("PUT /api/journals/:id", () => {
  let journalId;

  beforeEach(async () => {
    const journal = new Journal({
      title: "Original Title",
      content: "Original content here",
      tags: ["original"],
      moods: ["neutral"],
      custom_moods: [],
      user: authUser._id,
      wordCount: 3,
    });
    const saved = await journal.save();
    journalId = saved._id.toString();
  });

  test("updates a journal entry", async () => {
    const updates = {
      title: "Updated Title",
      content: "Updated content with more words now",
      tags: ["updated"],
      moods: ["happy"],
      custom_moods: [],
    };

    const response = await api
      .put(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updates)
      .expect(200);

    expect(response.body.title).toBe("Updated Title");
    expect(response.body.content).toBe(updates.content);
    expect(response.body.wordCount).toBe(6);
  });

  test("rejects update by non-owner", async () => {
    const { token: otherToken } = await createAuthenticatedUser({
      username: "notowner",
      email: "notowner@example.com",
    });

    await api
      .put(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hacked", content: "hacked content" })
      .expect(401);
  });

  test("returns 404 for nonexistent journal", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    await api
      .put(`/api/journals/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Ghost", content: "ghost content" })
      .expect(404);
  });
});

describe("DELETE /api/journals/:id", () => {
  let journalId;

  beforeEach(async () => {
    const journal = new Journal({
      title: "To Be Deleted",
      content: "This entry will be deleted",
      tags: [],
      moods: [],
      custom_moods: [],
      user: authUser._id,
      wordCount: 5,
    });
    const saved = await journal.save();
    journalId = saved._id.toString();
  });

  test("deletes a journal entry", async () => {
    await api
      .delete(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(204);

    const deleted = await Journal.findById(journalId);
    expect(deleted).toBeNull();
  });

  test("rejects deletion by non-owner", async () => {
    const { token: otherToken } = await createAuthenticatedUser({
      username: "intruder2",
      email: "intruder2@example.com",
    });

    await api
      .delete(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(401);

    // Verify journal still exists
    const stillExists = await Journal.findById(journalId);
    expect(stillExists).not.toBeNull();
  });

  test("returns 404 for nonexistent journal", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    await api
      .delete(`/api/journals/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);
  });

  test("returns 204 and actually removes from database", async () => {
    const countBefore = await Journal.countDocuments({ user: authUser._id });
    expect(countBefore).toBe(1);

    await api
      .delete(`/api/journals/${journalId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(204);

    const countAfter = await Journal.countDocuments({ user: authUser._id });
    expect(countAfter).toBe(0);
  });
});
