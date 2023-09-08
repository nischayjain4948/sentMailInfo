const express = require("express");
const authcontroller = require("../../controller/AuthenticationController");
const MyEnergiMappinController = new (require("../../controller/emailMappingController"))();

const auth = require("../../middleware/auth");

const router = express.Router();
router.get("/auth/hubspot", authcontroller.hubspotAuthenticationApp);
router.get("/account_details", auth.refreshTokens, authcontroller.getHubSpotAccountDetails);
router.get("/auth/hubspot/callback", authcontroller.hubspotauthcallback);



/* M Routes */











router.get("*", (req, res) => {
  return res.status(500).send({ success: false, error: "NO Route Found" });
});
module.exports = router;
