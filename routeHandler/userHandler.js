const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//const { db } = require("../Database/database.js");

//console.log(db);

const { PrismaClient } = require("@prisma/client");
const res = require("express/lib/response");
const cookieParser = require("cookie-parser");

const checkLogin = require("../middlewares/checkLogin");

const db = new PrismaClient();

// console.log(db);

// const app =express();
// app.use(express.json())
const router = express.Router();
router.use(express.json());
router.use(cookieParser(process.env.cookie_secret));

//signup
router.post("/signup", async (req, res) => {
  console.log("new user added");
  try {
    const {
      firstName,
      lastName,
      password,
      email,
      phoneNo,
      address,
      isVolunteer,
    } = req.body;
    console.log(req.body.password);
    const hashedPassword = await bcrypt.hash(password, 5);

    const user = await db.User.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        password: hashedPassword,
        email: email,
        phoneNo: phoneNo,
        address: address,
        isVolunteer: isVolunteer,
      },
    });
    res.status(200);
    res.json({ firstName: "new user added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Signup failed",
    });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    console.log("This is output");
    console.log(user.password);
    console.log("from input");
    console.log(req.body.password);
    if (user.id != null) {
      const isValidpass = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (isValidpass) {
        //if (user.password==req.body.password){
        const token = jwt.sign(
          {
            lastName: user.lastName,
            id: user.id,
            email: user.email,
            isVolunteer: user.isVolunteer,
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
});

// router.put("/active", async (req, res) => {
//   try {
//     const update = await db.User.update({
//       where: {
//         id: req.body.id,
//       },
//       data: {
//         status: req.body.status,
//       },
//     });
//     res.json({ msg: "Account activated" });
//   } catch (err) {
//     console.log(err);
//     res.json({ msg: "could not active account" });
//   }
// });

//patientAddition
router.post("/registerCause", async (req, res) => {
  try {
    const { patient_name, hospital, location, description, added_by } =
      req.body;
    console.log(hospital);
    const PatientAddition = await db.patientAddition.create({
      data: {
        patient_name: patient_name,
        hospital: hospital,
        location: location,
        description: description,
        added_by: added_by,
      },
    });
    console.log("added sadsa");
    res.status(200);
    res.json({ PatientAddition: "new parient added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "patient addition failed",
    });
  }
});

//donation addition
router.post("/registerDonation", async (req, res) => {
  try {
    const { type, amount, status, expiration, added_by } = req.body;
    console.log(added_by);
    const Donation = await db.donation.create({
      data: {
        type: type,
        amount: amount,
        status: status,
        expiration: expiration,
        added_by: added_by,
      },
    });
    console.log("added sadsa");
    res.status(200);
    res.json({ Donation: "new donation added successfully type: " + type });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "donation addition failed",
    });
  }
});

//donation organization
router.post("/orgDonation", async (req, res) => {
  try {
    const { type, amount, status, expiration, added_by } = req.body;
    console.log(added_by);
    const DonationOrg = await db.donationOrg.create({
      data: {
        type: type,
        amount: amount,
        status: status,
        expiration: expiration,
        added_by: added_by,
      },
    });
    console.log("added sadsa");
    res.status(200);
    res.json({ Donation: "new donation added successfully type: " + type });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "donation addition failed",
    });
  }
});

//patient details (support life)
router.get("/displaypatient", async (req, res) => {
  const pat = await db.patient.findMany();
  res.json({ pat });
});
module.exports = router;

/*

*/
