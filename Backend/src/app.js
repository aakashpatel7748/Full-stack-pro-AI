import express from "express"
// import session from "express-session";
import passport from "../src/auth/passport.js"
import indexRoutes from "./routes/index.routes.js"
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use("/api", indexRoutes)

export default app;