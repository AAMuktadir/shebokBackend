const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const checkLogin = async (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);

  try {
    const token = authorization.split(" ")[1];
    //console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const verifiedUser = await db.admin.findUnique({
      where: {
        email: decoded.email,
      },
    });
    if ((verifiedUser != null) & (verifiedUser.isVolunteer == true)) {
      const lName = decoded.lastName;
      req.lastName = lName;
      req.id = decoded.id;
      req.email = decoded.email;
      next();
    }
  } catch (err) {
    console.log(err);
    next("Authentication Failure! \n please login");
    res.status(404).json({
      message: "Authentication Failure! \n please login",
    });
  }
};

module.exports = checkLogin;
