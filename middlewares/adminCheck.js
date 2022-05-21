const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const adminCheck = async (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);

  try {
    const token = authorization.split(" ")[1];
    //console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const verifiedUser = await db.admin.findUnique({
      where: {
        userName: decoded.userName,
      },
    });
    console.log("this is verified user");
    console.log(verifiedUser);
    if (verifiedUser != null) {
      const name = decoded.name;
      req.name = name;
      req.id = decoded.id;
      req.userName = decoded.UserName;
      req.role = decoded.role;
      next();
    } else {
      throw err;
    }
  } catch (err) {
    console.log(err);
    next("Authentication Failure! \n please login");
    res.status(404).json({
      message: "Authentication Failure! \n please login",
    });
  }
};

module.exports = adminCheck;
