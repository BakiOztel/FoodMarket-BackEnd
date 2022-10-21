const userModel = require("../Model/userModel.js");
const hashing = require("../Middleware/encryptionHandler.js");
const jwt = require("jsonwebtoken");
exports.userLogin = async (req, res, next) => {

    const user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.status(401).send({ message: "Wrong mail" })
    if (user) {
        if (hashing.decryptPassword(req.body.password, user.password)) {
            const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_KEY);
            res.cookie("user", token, { httpOnly: false });
            return res.status(200).json({ message: "login succes" });
        } else {
            return res.status(401).send({ message: "Wrong password" });
        }
    }
}

exports.userLoginRepeat = async (req, res, next) => {
    const token = req.cookies.user;
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
    const user = new userModel({
        email: req.body.email,
        password: hashpassword
    });
    await user.save().then(() => {
        res.status(200);
    }).catch(err => {
        console.log(err);
    });
}