const userModel = require("../Model/userModel.js");
const jwt = require("jsonwebtoken");

exports.refreshTokenHandler = async (req, res) => {

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    const foundUser = userModel.findOne({ refreshToken }).exec();
    if (!foundUser) {
        jwt.verify(refreshToken, process.env.JWT_KEY_REFRESH_TOKEN,
            async (err, decoded) => {
                if (err) return res.sendStatus(403);
                //Delete Refresh token
                const stolenAccount = await userModel.findOne({ _id: decoded._id }).exec();
                stolenAccount.refreshToken = "";
                const result = await stolenAccount.save();
            }
        )
        return res.sendStatus(403);
    }
    const newRefreshToken = foundUser.refreshToken
    jwt.verify(refreshToken, process.env.JWT_KEY_REFRESH_TOKEN, async (err, decoded) => {
        if (err) {
            foundUser.refreshToken = newRefreshToken;
            const result = await foundUser.save();
        }
        if (err || foundUser._id !== decoded._id) return res.sendStatus(403);
        const userx = { _id: foundUser._id, email: foundUser.email }

        const accessToken = jwt.sign({ userInfo: userx }, process.env.JWT_KEY, { expiresIn: "15s" });
        const refreshToken = jwt.sign({ userInfo: userx }, process.env.JWT_KEY_REFRESH_TOKEN, { expiresIn: "10s" });

        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

        res.json({ accessToken })
    })
};