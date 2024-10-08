import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import hpp from "hpp";
import session from "express-session";
import mongoSanitize from "express-mongo-sanitize";
import userRouter from "./routes/user.routes.js";
import { valkeyStore } from "./db/valkey.js";

const cookieOptions = {
  httpOnly: true,
  secure: false, //Change To True In Production Very Important******
  sameSite: "lax", // Set to strict/lax so it only accept request from same site or something :P
  maxAge: 1000 * 60 * 60 * 24,
};

const sessionOptions = {
  name: "sessionId",
  store: valkeyStore,
  resave: false, // required: force lightweight session keep alive (touch)
  saveUninitialized: true, // false recommended: only save session when data exists
  secret: process.env.SESSION_SECRET,
  cookie: cookieOptions,
  maxAge: 1000 * 60 * 60 * 24,
};

const app = express();

//app.set("trust proxy", 1); //for proxy related issues

app.use(helmet());
app.use(hpp());
app.use(mongoSanitize());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(morgan("combined"));
app.use(session(sessionOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static('public'));

app.use("/api/v1/user", userRouter);

app.get("/oauth/:error", (req, res) => {
  res.send(req.params.error);
});
app.get("/", (req, res) => res.status(200).json({ Message: "Hi!" }));
app.get("/home", (req, res) => {
  if (!req.session.userId)
    return res.redirect(`http://localhost:3000/oauth/Not Authenticated!`);
  res.status(200).json({ Message: "Successfully Logged In! ", User: req.user });
});

export default app;