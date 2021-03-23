const queryString = require("query-string");
const { URL } = require("url");
const axios = require("axios");
const User = require("../User");
const Token = require("../Token");
const jwt = require("jsonwebtoken");

function GoogleAuth(req, res) {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/api/auth/google-redirect`,
    scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"].join(
      " "
    ), // space seperated string
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
  });

  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
  return res.redirect(googleLoginUrl);
}
async function GoogleAuthRedirect(req, res) {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParams = queryString.parse(urlObj.search);
  const code = urlParams.code;
  const tokenData = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: "post",
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BASE_URL}/api/auth/google-redirect`,
      grant_type: "authorization_code",
      code,
    },
  });
  const userData = await axios({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  });

  const UserStatus = await User.findOne({ email: userData.data.email });

  let token;

  if (UserStatus) {
    token = GoogleLogin(userData.data.email);
  } else {
    token = GoogleRegister(userData.data.email);
  }
  token.then((data) => res.redirect(`http://kapusta.fun?token=${data}`));
}
async function GoogleLogin(email) {
  const user = await User.findOne({
    email,
  });
  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.TOKEN_SECRET
  );
  const tokens = await Token.create({
    token: token,
  });
  await User.findByIdAndUpdate(user._id, {
    $push: {
      tokenid: tokens._id,
    },
  });

  return token;
}
async function GoogleRegister(email) {
  await User.create({
    email: email,
    password: "google",
    verificationToken: "",
  });

  const userId = await User.findOne({ email: email });
  const token = jwt.sign({ userId: userId._id }, process.env.TOKEN_SECRET);
  const tokens = await Token.create({
    token: token,
  });
  await User.findByIdAndUpdate(userId._id, { tokenid: tokens._id });
  return token;
}
module.exports = { GoogleAuth, GoogleAuthRedirect };
