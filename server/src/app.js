import express from "express";
import cors from "cors";
import mainRouter from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", mainRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

export default app;
