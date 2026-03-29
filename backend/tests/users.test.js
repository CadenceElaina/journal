require("./setup");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const { testUser, createAuthenticatedUser } = require("./helpers");

const api = supertest(app);

describe("POST /api/users (registration)", () => {
  test("creates a new user with valid data", async () => {
    const response = await api
      .post("/api/users")
      .send(testUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    expect(response.body.username).toBe(testUser.username);
    expect(response.body.email).toBe(testUser.email);
    expect(response.body.firstName).toBe(testUser.firstName);
    expect(response.body.role).toBe(testUser.role);
    expect(response.body.passwordHash).toBeUndefined();
  });

  test("does not return password hash", async () => {
    const response = await api.post("/api/users").send(testUser).expect(201);

    expect(response.body.passwordHash).toBeUndefined();
  });

  test("rejects duplicate username", async () => {
    await api.post("/api/users").send(testUser).expect(201);

    const response = await api
      .post("/api/users")
      .send({ ...testUser, email: "other@example.com" })
      .expect(400);

    expect(response.body.error).toMatch(/already taken/i);
  });

  test("rejects duplicate email", async () => {
    await api.post("/api/users").send(testUser).expect(201);

    const response = await api
      .post("/api/users")
      .send({ ...testUser, username: "otheruser" })
      .expect(400);

    expect(response.body.error).toMatch(/already registered/i);
  });

  test("rejects weak password", async () => {
    const response = await api
      .post("/api/users")
      .send({ ...testUser, password: "weak" })
      .expect(400);

    expect(response.body.errors).toBeDefined();
  });

  test("rejects missing firstName", async () => {
    const { firstName, ...noFirstName } = testUser;
    const response = await api.post("/api/users").send(noFirstName).expect(400);

    expect(response.body.errors).toBeDefined();
  });

  test("rejects invalid email format", async () => {
    const response = await api
      .post("/api/users")
      .send({ ...testUser, email: "not-an-email" })
      .expect(400);

    expect(response.body.errors).toBeDefined();
  });

  test("rejects username shorter than 3 characters", async () => {
    const response = await api
      .post("/api/users")
      .send({ ...testUser, username: "ab" })
      .expect(400);

    expect(response.body.errors).toBeDefined();
  });

  test("normalizes email to lowercase", async () => {
    const response = await api
      .post("/api/users")
      .send({ ...testUser, email: "TEST@EXAMPLE.COM" })
      .expect(201);

    expect(response.body.email).toBe("test@example.com");
  });

  test("sets nonProvider onboarding as completed", async () => {
    await api.post("/api/users").send(testUser).expect(201);

    const user = await User.findOne({ username: testUser.username });
    expect(user.onboardingCompleted).toBe(true);
  });

  test("sets provider onboarding as not completed", async () => {
    await api
      .post("/api/users")
      .send({
        ...testUser,
        username: "provideruser",
        email: "provider@example.com",
        role: "provider",
      })
      .expect(201);

    const user = await User.findOne({ username: "provideruser" });
    expect(user.onboardingCompleted).toBe(false);
  });
});

describe("DELETE /api/users/account", () => {
  test("deletes user account and all associated data", async () => {
    const { user, token, password } = await createAuthenticatedUser();

    await api
      .delete("/api/users/account")
      .set("Authorization", `Bearer ${token}`)
      .send({ password, confirmDelete: true })
      .expect(200);

    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeNull();
  });

  test("rejects deletion without correct password", async () => {
    const { token } = await createAuthenticatedUser();

    await api
      .delete("/api/users/account")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "WrongPass123!", confirmDelete: true })
      .expect(401);
  });

  test("rejects deletion without confirmDelete flag", async () => {
    const { token, password } = await createAuthenticatedUser();

    await api
      .delete("/api/users/account")
      .set("Authorization", `Bearer ${token}`)
      .send({ password })
      .expect(400);
  });

  test("requires authentication", async () => {
    await api
      .delete("/api/users/account")
      .send({ password: "TestPass123!", confirmDelete: true })
      .expect(401);
  });
});
