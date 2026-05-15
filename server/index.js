import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import dbConnection from "./utils/connectDB.js";

dotenv.config();

dbConnection();

const port = process.env.PORT || 5000;
// Allowed origins for CORS. Prefer setting CORS_ORIGIN in the environment as a
// comma-separated list (e.g. "https://your-frontend.app,https://other.app").
// Keep a minimal localhost default for local development only.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:3001"];

const isProduction = process.env.NODE_ENV === "production";

const app = express();

// When running behind a proxy (Railway, Heroku, etc.) express must trust the proxy
// so that `req.secure` is set correctly and secure cookies (secure: true) can be sent.
if (isProduction) {
  app.set("trust proxy", 1);
}

// Log a minimal environment summary (do NOT log sensitive values).
console.log(`NODE_ENV=${process.env.NODE_ENV || 'undefined'}  isProduction=${isProduction}`);
console.log(`JWT_SECRET set=${process.env.JWT_SECRET ? 'yes' : 'no'}`);
console.log(`CORS_ORIGIN=${process.env.CORS_ORIGIN || allowedOrigins.join(',')}`);

app.get("/", (req, res) => {
  res.status(200).json({ status: true, message: "Task Manager API is running." });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: true, message: "OK" });
});

// For production, allow cross-origin requests from the requesting origin
// so that cookies can be set when frontend and backend share a domain
// (Railway deployments may serve the frontend and backend from the same host).
// Configure CORS with a dynamic origin checker so we only allow configured
// frontends. This ensures credentialed requests (cookies) succeed only for
// known origins.
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

//app.use(morgan("dev"));
app.use("/api", routes);

app.use(routeNotFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on ${port}`));
