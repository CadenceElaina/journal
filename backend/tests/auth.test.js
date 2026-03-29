require("./setup");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const {
  testUser,
  createTestUser,
  createAuthenticatedUser,
} = require("./helpers");

const api = supertest(app);

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await createTestUser();
  });

  test("succeeds with valid credentials", async () => {
    const response = await api
      .post("/api/auth/login")
      .send({ username: testUser.username, password: testUser.password })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.token).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.username).toBe(testUser.username);
    expect(response.body.firstName).toBe(testUser.firstName);
    expect(response.body.role).toBe(testUser.role);
  });

  test("fails with wrong password", async () => {
    const response = await api
      .post("/api/auth/login")
      .send({ username: testUser.username, password: "WrongPass123!" })
      .expect(401);

    expect(response.body.error).toBe("invalid username or password");
    expect(response.body.token).toBeUndefined();
  });

  test("fails with nonexistent username", async () => {
    const response = await api
      .post("/api/auth/login")
      .send({ username: "ghostuser", password: "WrongPass123!" })
      .expect(401);

    expect(response.body.error).toBe("invalid username or password");
  });

  test("increments failed login attempts on wrong password", async () => {
    await api
      .post("/api/auth/login")
      .send({ username: testUser.username, password: "WrongPass123!" });

    const user = await User.findOne({ username: testUser.username });
    expect(user.failedLoginAttempts).toBe(1);
  });

  test("locks account after 5 failed attempts", async () => {
    for (let i = 0; i < 5; i++) {
      await api
        .post("/api/auth/login")
        .send({ username: testUser.username, password: "WrongPass123!" });
    }

    const response = await api
      .post("/api/auth/login")
      .send({ username: testUser.username, password: testUser.password })
      .expect(423);

    expect(response.body.message).toMatch(/temporarily locked/);
  });

  test("resets failed attempts on successful login", async () => {
    // Fail twice
    await api
      .post("/api/auth/login")
      .send({ username: testUser.username, password: "WrongPass123!" });
    await api
      .post("/api/auth/login")
      .send({ username: testUser.username, password: "WrongPass123!" });

    // Succeed
    await api
      .post("/api/auth/login")
      .send({ username: testUser.username, password: testUser.password })
      .expect(200);

    const user = await User.findOne({ username: testUser.username });
    expect(user.failedLoginAttempts).toBe(0);
  });

  test("does not return password hash in response", async () => {
    const response = await api
      .post("/api/auth/login")
      .send({ username: testUser.username, password: testUser.password })
      .expect(200);

    expect(response.body.passwordHash).toBeUndefined();
    expect(response.body.refreshToken).toBeDefined(); // refresh token IS returned to client
  });
});

describe("POST /api/auth/refresh", () => {
  test("returns new tokens with valid refresh token", async () => {
    const { user, refreshToken } = await createAuthenticatedUser();

    const response = await api
      .post("/api/auth/refresh")
      .send({ refreshToken })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    // Verify the database was updated with the new refresh token
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.refreshToken).toBe(response.body.refreshToken);
  });

  test("fails without refresh token", async () => {
    await api.post("/api/auth/refresh").send({}).expect(401);
  });

  test("fails with invalid refresh token", async () => {
    await api
      .post("/api/auth/refresh")
      .send({ refreshToken: "invalid-token-string" })
      .expect(401);
  });

  test("invalidates old refresh token after rotation", async () => {
    const { refreshToken } = await createAuthenticatedUser();

    // First refresh - should succeed and rotate token
    const response = await api
      .post("/api/auth/refresh")
      .send({ refreshToken })
      .expect(200);

    const newRefreshToken = response.body.refreshToken;

    // Use the new token for another refresh - should still work
    const response2 = await api
      .post("/api/auth/refresh")
      .send({ refreshToken: newRefreshToken })
      .expect(200);

    expect(response2.body.accessToken).toBeDefined();
    expect(response2.body.refreshToken).toBeDefined();
  });
});

describe("POST /api/auth/logout", () => {
  test("clears refresh token and returns 204", async () => {
    const { user, refreshToken } = await createAuthenticatedUser();

    await api.post("/api/auth/logout").send({ refreshToken }).expect(204);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.refreshToken).toBeNull();
  });

  test("returns 204 even without refresh token", async () => {
    await api.post("/api/auth/logout").send({}).expect(204);
  });
});
