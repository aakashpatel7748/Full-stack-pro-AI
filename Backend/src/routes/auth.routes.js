import { Router } from "express";
import passport from "../auth/passport.js";


const router = Router()

router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email", "https://mail.google.com/", "https://www.googleapis.com/auth/calendar"],
    accessType: "online",
    prompt: "consent"
}))

router.get("/google/callback", passport.authenticate("google", {
    failureRedirect: "/login",
    session: false
}), (req, res) => {

    const user = req.user;
    const token = user.generateAuthToken()

    res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Required for SameSite=None
        sameSite: "none", // Allow cross-site cookie usage
    })


    const targetUrl = (process.env.FRONTEND_URL || "http://localhost:5173") + "/chat";
    res.redirect(targetUrl);
})


export default router;