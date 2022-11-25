const userModel = require("../Model/userModel.js");
const hashing = require("../Middleware/encryptionHandler.js");
const jwt = require("jsonwebtoken");
exports.userLogin = async (req, res, next) => {
    console.log(req.body.email);
    const cookies = req.cookies;
    const foundUser = await userModel.findOne({ email: req.body.email }).exec();
    var userRefreshToken = "";
    //Unauthorized 
    if (!foundUser) return res.status(401).send({ message: "Wrong mail" })

    if (foundUser) {
        // evaluate password 
        if (hashing.decryptPassword(req.body.password, foundUser.password)) {

            const userx = { _id: foundUser._id, email: foundUser.email }

            const accessToken = jwt.sign({ userInfo: userx }, process.env.JWT_KEY, { expiresIn: "15s" });
            const refreshToken = jwt.sign({ userInfo: userx }, process.env.JWT_KEY_REFRESH_TOKEN, { expiresIn: "10s" });
            userRefreshToken = refreshToken;

            if (cookies?.jwt) {
                const refreshToken = cookies.jwt;
                const foundToken = await userModel.findOne({ refreshToken }).exec();
                if (!foundToken) {
                    userRefreshToken = "";
                }
                res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
            }
            foundUser.refreshToken = userRefreshToken;
            const result = await foundUser.save();

            // Creates Secure Cookie with refresh token
            res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
            // Send authorization roles and access token to user
            res.json({ accessToken, user: foundUser });
            console.log("çalıştı");
        } else {
            //invalid password 
            return res.status(401).send({ message: "Wrong password" });
        }
    }

}

exports.userLoginRepeat = async (req, res, next) => {
    const token = req.cookies.user;
    console.log("token");
    jwt.verify(token, process.env.JWT_KEY, (error, decodedToken) => {
        if (decodedToken) {
            userModel.findById(decodedToken._id).then(users => {
                return res.status(200).json({ user: { email: users.email, id: users._id } });
            }).catch(err => {
                console.log("there is no such account:" + err);
                return res.status(200).send({ message: "there is no such account" });
            })
        } else {
            return res.status(401).send({ message: "there is no such account" });
        }
    })

}

exports.userRegister = async (req, res, next) => {

    const hashpassword = await hashing.encryptPassword(req.body.password);
    const data = await userModel.findOne({ email: req.body.email });
    if (data) {
        res.status(409).send({ error: true, message: "there is such a mail" });
        console.log("error register");
    } else {
        const user = new userModel({
            email: req.body.email,
            password: hashpassword
        });
        await user.save().then(() => {
            res.status(200).send({ error: false });
            console.log("succes register");
        }).catch(err => {
            console.log(err);
        });
    }
}
