const express = require("express");

const usercontroller = require("../controller/UserController");
const emailMappingController = new (require("../controller/emailMappingController"))();
const authcontroller = require("../controller/AuthenticationController");
const emailSendController = require("../controller/emailSendController");


const auth = require("../middleware/auth");
const router = express.Router();
//route operations
router.get("/user-enroll", (req, res) => res.render("UserEnroll"));
router.get("/", (req, res) => res.redirect("/login"));
router.get("/register", (req, res) => res.render("register"));
router.get("/login", (req, res) => res.render("login"));
router.get("/account_details", auth.refreshTokens, authcontroller.getHubSpotAccountDetails);
router.get("/forgot-password", (req, res) => res.render("forgot-password"));
router.post("/register", usercontroller.registerUserController);
router.post("/login", usercontroller.loginUserController);
router.post("/api/user/change-password", auth.verifyUserbyhvrif, usercontroller.changePassword);
router.post("/logsdata", usercontroller.logsdata);
router.get("/logs", auth.refreshTokens, usercontroller.getLogs);
router.get("/logss/:i", usercontroller.getLogs);
router.get("/populateData", auth.refreshTokens, usercontroller.serversidelogs);


router.get("/appdashboard", usercontroller.appdashboard);
router.get("/viewuser/:id", emailSendController.viewlogs);
////Active owner page
router.get("/activeowner", emailSendController.activeOwner);


// Email Setting Page
router.get("/mailsetting", emailSendController.EmailSetting);
router.post("/savemailsettings", emailSendController.saveEmailSetting);

router.get("*", (req, res) => res.render("404"));

module.exports = router;
