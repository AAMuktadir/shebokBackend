const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");
const res = require("express/lib/response");
const cookieParser = require("cookie-parser");

const adminCheck = require("../middlewares/adminCheck");

const db = new PrismaClient();

const adminRouter = express.Router();
adminRouter.use(express.json());
adminRouter.use(cookieParser(process.env.cookie_secret));

//Adminsignup
adminRouter.post("/addAdmin", adminCheck, async (req, res) => {
  console.log("new Admin added");
  if (adminCheck.role == "super") {
    try {
      const { userName, name, role, password } = req.body;
      console.log(req.body.password);
      const hashedPassword = await bcrypt.hash(password, 5);

      const Admin = await db.admin.create({
        data: {
          userName: userName,
          name: name,
          password: hashedPassword,
          role: role,
        },
      });
      res.status(200);
      res.json({ Admin: "new Admin added successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Signup failed",
      });
    }
  } else {
    res.status(500).json({
      message: "not authorized",
    });
  }
});

//login
adminRouter.post("/Adminlogin", async (req, res) => {
  if ((req.body.userName == "planetx") & (req.body.password == "planetx")) {
    const token = jwt.sign(
      {
        name: "planetx inc",
        id: 1,
        userName: "planetx",
        role: "super",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("access_token", token, {
      maxAge: 86400000,
      httpOnly: true,
      signed: true,
    });

    res.status(200).json({
      access_token: token,
      message: "login successful",
    });
  } else {
    try {
      const admin = await db.admin.findUnique({
        where: {
          userName: req.body.userName,
        },
      });

      console.log("This is output");
      console.log(admin.password);
      console.log("from input");
      console.log(req.body.password);
      if (admin.id != null) {
        const isValidpass = await bcrypt.compare(
          req.body.password,
          admin.password
        );

        if (isValidpass) {
          //if (user.password==req.body.password){
          const token = jwt.sign(
            {
              name: admin.name,
              id: admin.id,
              userName: admin.userName,
              role: admin.role,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );
          res.cookie("access_token", token, {
            maxAge: 86400000,
            httpOnly: true,
            signed: true,
          });

          res.status(200).json({
            access_token: token,
            message: "login successful",
          });
        } else {
          res.status(401).json({
            error: "authentication failed(not valid pass)",
          });
        }
      } else {
        res.status(401).json({
          error: "authentication failed(user name)",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({
        error: "authentication failed",
      });
    }
  }
});

adminRouter.post("/addorg", adminCheck, async (req, res) => {
  try {
    const { org_id, orgName, contact, ew, address, added_by } = req.body;
    console.log(added_by);
    const DonationOrg = await db.organization.create({
      data: {
        org_id: org_id,
        orgName: orgName,
        contact: contact,
        ew: ew,
        address: address,
        added_by: added_by,
      },
    });
    console.log("added sadsa");
    res.status(200);
    res.json({
      Donation: "new organization added successfully type: " + orgName,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "organization addition failed",
    });
  }
});

adminRouter.get("/displayOrg", adminCheck, async (req, res) => {
  const org = await db.organization.findMany();
  res.json({ org });
});

adminRouter.get("/users", adminCheck, async (req, res) => {
  const users = await db.user.findMany();
  res.json({ users });
});

adminRouter.get("/volunteer", adminCheck, async (req, res) => {
  const volunteer = await db.user.findMany({
    where: {
      isVolunteer: true,
    },
  });
  res.json({ volunteer });
});

adminRouter.put("/editorg", adminCheck, async (req, res) => {
  try {
    const update = await db.organization.update({
      where: {
        org_id: req.body.id,
      },
      data: {
        orgName: req.body.name,
      },
    });
    res.json({ msg: "Edited" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "update failed" });
  }
});

adminRouter.delete("/deleteorg", adminCheck, async (req, res) => {
  try {
    const user = await db.organization.delete({
      where: {
        org_id: req.body.id,
      },
    });

    res.status(200).json({
      message: "deleted successfully",
    });
  } catch {
    res.status(404).json({
      message: "could not find user",
    });
  }
});

module.exports = adminRouter;
