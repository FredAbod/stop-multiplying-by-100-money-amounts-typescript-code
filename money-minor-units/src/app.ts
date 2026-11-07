import express from "express";
import { checkoutRouter } from "./routes/checkout.js";

export const app = express();

app.use(express.json());
app.use(checkoutRouter);
