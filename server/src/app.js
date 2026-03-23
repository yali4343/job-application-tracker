import express from "express";
import cors from "cors";
import mainRouter from "./routes/index.js";

const allowedOrigins = [
  "http://localhost:5173",
  "https://job-application-tracker-yali4343s-projects.vercel.app/",
];

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser tools (no Origin header) if you want
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api", mainRouter);

app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    console.error("Unhandled error:", { message: err?.message });
  } else {
    console.error(err);
  }

  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
