require("./setup");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const Journal = require("../models/journal");

const api = supertest(app);

describe("POST /api/demo", () => {
  test("creates a demo session with token and seeded data", async () => {
    const response = await api
      .post("/api/demo")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.token).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.username).toMatch(/^demo_/);
    expect(response.body.remainingMs).toBeDefined();
    expect(response.body.user.isDemo).toBe(true);
    expect(response.body.user.isEmailVerified).toBe(true);
  });

  test("demo user has seeded journal entries", async () => {
    const response = await api.post("/api/demo").expect(200);
    const token = response.body.token;

    const journalsResponse = await api
      .get("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(journalsResponse.body.journals.length).toBeGreaterThan(0);
  });

  test("demo user is flagged as demo in database", async () => {
    const response = await api.post("/api/demo").expect(200);
    const user = await User.findOne({ username: response.body.username });

    expect(user.isDemo).toBe(true);
    expect(user.isEmailVerified).toBe(true);
  });

  test("demo sessions are isolated from each other", async () => {
    const demo1 = await api.post("/api/demo").expect(200);
    const demo2 = await api.post("/api/demo").expect(200);

    expect(demo1.body.username).not.toBe(demo2.body.username);

    // Each demo gets only their own journals
    const journals1 = await api
      .get("/api/journals")
      .set("Authorization", `Bearer ${demo1.body.token}`)
      .expect(200);

    const journals2 = await api
      .get("/api/journals")
      .set("Authorization", `Bearer ${demo2.body.token}`)
      .expect(200);

    expect(journals1.body.journals.length).toBe(journals2.body.journals.length);

    // Verify journal IDs are different (each demo has own copies)
    const ids1 = journals1.body.journals.map((j) => j.id);
    const ids2 = journals2.body.journals.map((j) => j.id);
    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });

  test("demo user can create journal entries", async () => {
    const response = await api.post("/api/demo").expect(200);
    const token = response.body.token;

    const journalResponse = await api
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Demo Test Entry",
        content: "Testing demo journal creation",
        tags: ["test"],
        moods: ["curious"],
        custom_moods: [],
      })
      .expect(200);

    expect(journalResponse.body.title).toBe("Demo Test Entry");
  });

  test("demo user cannot access another users journals", async () => {
    // Create a real user with a journal
    const { createAuthenticatedUser } = require("./helpers");
    const { user: realUser, token: realToken } =
      await createAuthenticatedUser();

    await api
      .post("/api/journals")
      .set("Authorization", `Bearer ${realToken}`)
      .send({
        title: "Private Entry",
        content: "This is private",
        tags: [],
        moods: [],
        custom_moods: [],
      })
      .expect(200);

    // Demo user should not see the real user's journals
    const demoResponse = await api.post("/api/demo").expect(200);
    const demoJournals = await api
      .get("/api/journals")
      .set("Authorization", `Bearer ${demoResponse.body.token}`)
      .expect(200);

    const titles = demoJournals.body.journals.map((j) => j.title);
    expect(titles).not.toContain("Private Entry");
  });
});
