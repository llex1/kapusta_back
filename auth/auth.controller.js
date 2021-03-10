class AuthController {
  registration(req, res, next) {
    res.status("200").send("oK_");

    next();
  }
}

module.exports = new AuthController();
