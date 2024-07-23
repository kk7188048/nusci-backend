import request from "supertest";
import app from "../../../app/app.js";
import Connection from "../../../app/db/connection.js";
import logTestSuite from "../../util.js";
import {
  validUserLoginRaisa,
  validUserLoginEthan,
  invalidUserLoginEthan,
  invalidUserLoginRaisa,
  pendingUserLoginAce,
  validUserSignup,
  existingUsernameSignup,
  existingEmailSignup,
  validUsernameQueryRaisa,
  validUsernameQueryEthan,
} from "../../testData/userTestData.js";

afterAll(async () => {
  await Connection.close();
});

describe("User Login Tests", () => {
  test("should login a valid user Raisa", async () => {
    const response = await request(app).post("/user/login").send(validUserLoginRaisa);

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  test("should login a valid user Ethan", async () => {
    const response = await request(app).post("/user/login").send(validUserLoginEthan);

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  test("should not login with incorrect password for Ethan", async () => {
    const response = await request(app).post("/user/login").send(invalidUserLoginEthan);

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(400);
  });

  test("should not login with incorrect password for Raisa", async () => {
    const response = await request(app).post("/user/login").send(invalidUserLoginRaisa);

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(400);
  });

  test("should not login with non-existent username", async () => {
    const response = await request(app).post("/user/login").send({
      username: "nonexistentuser",
      password: "password",
    });

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(404);
  });

  test("should not login if user is unapproved", async () => {
    const response = await request(app).post("/user/login").send(pendingUserLoginAce);

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(400);
  });
});

describe("User Signup Tests", () => {
  test("should signup a new user successfully", async () => {
    const response = await request(app).post("/user/signup").send(validUserSignup);

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Signup successful");
  });

  test("should not signup with existing username", async () => {
    const response = await request(app).post("/user/signup").send(existingUsernameSignup);

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(400);
  });

  test("should not signup with existing email", async () => {
    const response = await request(app).post("/user/signup").send(existingEmailSignup);

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(400);
  });
});


describe("Get User By Username Tests", () => {
  test("get a user by a valid/existing username raisa", async () => {
    const response = await request(app).get("/user/username/raisa");

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(validUsernameQueryRaisa);
    expect(response.body.username).toBe("raisa");
  });

  test("get a user by a valid/existing username ethan", async () => {
    const response = await request(app).get("/user/username/ethan");

    logTestSuite.user && console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(validUsernameQueryEthan);
    expect(response.body.username).toBe("ethan");
  });

  test("attempt getting an invalid username", async () => {
    const response = await request(app).get("/user/username/nonexistentuser");

    logTestSuite.user && console.log(response.body);
    expect(response.body).toStrictEqual({ error: "User not found." });
    expect(response.status).toBe(404);
  });

});
