import mongoose from "mongoose";
import crypto from "crypto-js";
import config from "../config/config.js";
import jwt from "jsonwebtoken"

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    googleRefreshToken: {
        type: String,
        require: true
    }

})

UserSchema.pre("save", async function (next) {
    if (this.isModified("googleRefreshToken")) {
        const cipherText = crypto.AES.encrypt(this.googleRefreshToken, config.GOOGLE_SECRET_KEY);
        this.googleRefreshToken = cipherText.toString()
    }
    next()
})

UserSchema.methods.decryptGoogleRefreshToken = function () {
    console.log("Decrypting Google Refresh Token", this.googleRefreshToken);
    
    const bytes = crypto.AES.decrypt(this.googleRefreshToken, config.GOOGLE_SECRET_KEY);
    const originalText = bytes.toString(crypto.enc.Utf8);
    return originalText
}

UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ id: this._id }, config.JWT_SECRET, )
    // { expiresIn: "1h" }
    return token
}

UserSchema.statics.authToken =async function(token){
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await this.findById(decoded.id);
        if(!user){
            throw new Error("User not found");
        }
        return user
    } catch (error) {
        throw new Error("Invalid token");
    }
}

const User = mongoose.model("user", UserSchema);

export default User