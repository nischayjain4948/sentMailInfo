// const hubspot = require("@hubspot/api-client");
const qs = require("qs");
var request = require("request");
// const hubspotClient = new hubspot.Client({
//   apiKey: process.env.HUBSPOT_APIKEY,
// });
const axios = require("axios");
const moment = require("moment");
const { encryptData, decryptData, isTokenExpired } = require("../utils/util");
const { tokens, hubsagefields, syncingtimelog, userregister } = require("../models");
const ErrorResponse = require("../utils/ErrorRespnse");
exports.hubspotAuthenticationApp = async (req, res, next) => {
  // Build the auth URL
  const authUrl =
    "https://app.hubspot.com/oauth/authorize" +
    `?client_id=${encodeURIComponent(process.env.HUBSPOT_CLIENT_ID)}` +

    `&scope=business-intelligence%20oauth%20e-commerce%20crm.lists.read%20crm.objects.contacts.read%20crm.objects.contacts.write%20crm.schemas.custom.read%20crm.objects.custom.read%20crm.objects.custom.write%20crm.objects.companies.write%20crm.schemas.contacts.read%20crm.lists.write%20crm.objects.companies.read%20crm.objects.deals.read%20crm.objects.deals.write%20crm.schemas.companies.read%20crm.schemas.companies.write%20crm.schemas.contacts.write%20crm.schemas.deals.read%20crm.schemas.deals.write%20crm.objects.owners.read%20crm.objects.quotes.write%20crm.objects.quotes.read%20crm.schemas.quotes.read%20crm.objects.line_items.read%20crm.objects.line_items.write%20crm.schemas.line_items.read` +
    `&redirect_uri=${encodeURIComponent(process.env.HUBSPOT_REDIRECT_URI)}`;
  // Redirect the user
  // console.log(authUrl);
  return res.redirect(authUrl);
};
exports.hubspotauthcallback = async (req, res, next) => {

  //console.log("hub")

  try {
    // console.log({ query: req.query, sss: res.cookie });
    // Build the auth URL
    if (req.query.code) {
      // Handle the received code
      var options = {
        method: "POST",
        url: "https://api.hubapi.com/oauth/v1/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        form: {
          grant_type: "authorization_code",
          client_id: process.env.HUBSPOT_CLIENT_ID,
          client_secret: process.env.HUBSPOT_CLIENT_SECRET,
          redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
          code: req.query.code,
        },
      };
      request(options, async function (error, response) {
        if (error) throw new Error(error);
        //console.log("response.body",response.body);
        let data = JSON.parse(response.body);

        // Getting User Account Details
        let account_details = await axios.get(`https://api.hubapi.com/oauth/v1/access-tokens/${data.access_token}`);
        //  console.log("account_details",account_details);
        //   account_details = JSON.parse(JSON.stringify(account_details.data));
        account_details = account_details.data;
        let get_owner_account_data = await axios.get(
          `https://api.hubapi.com/crm/v3/owners/?email=${account_details.user}`,
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );
        // Getting Owner Account User Details
        if (get_owner_account_data.status == 200)
          get_owner_account_data = get_owner_account_data.data.results[0];
        account_details = {
          email: account_details.user,
          firstname: get_owner_account_data.firstName,
          lastname: get_owner_account_data.lastName,
          hub_domain: account_details.hub_domain,
          hub_id: account_details.hub_id,
          app_id: account_details.app_id,
          user_id: account_details.user_id,
          token_type: account_details.token_type,
        };
        let user = await userregister.findOne({ email: account_details.email });
        if (!user) {
          let hubspot_create_user_body = {
            properties: {
              email: account_details.email,
              firstname: get_owner_account_data.firstName,
              lastname: get_owner_account_data.lastName,
              hs_lead_status: "NEW",
              platform: process.env.PLATFORM,
            },
          };
          // await axios.post("https://api.hubapi.com/crm/v3/objects/contacts?hapikey=83d50456-ff8a-4c07-a8fb-ebb76f8c567b", hubspot_create_user_body);
        }
        //console.log(account_details);
        let updateOrCreateUser = await userregister.findOneAndUpdate(
          { email: account_details.email },
          {
            email: account_details.email,
            firstname: get_owner_account_data.firstName,
            lastname: get_owner_account_data.lastName,
            hub_domain: account_details.hub_domain,
            hub_id: account_details.hub_id,
            app_id: account_details.app_id,
            user_id: account_details.user_id,
            token_type: account_details.token_type,
          },
          { new: true, upsert: true }
        );
        // console.log("sssss", updateOrCreateUser);

        if (updateOrCreateUser) {
          tokens.findOneAndUpdate(
            {
              tokenname: "hoautk",
              user_id: updateOrCreateUser._id,
              platform: process.env.PLATFORM,
            },
            {
              tokenname: "hoautk",
              platform: process.env.PLATFORM,
              user_id: updateOrCreateUser._id,
              access_token: encryptData({ data: data.access_token }),
              refresh_token: encryptData({ data: data.refresh_token }),
              access_token_expire_in: data.expires_in,
              refresh_token_expire_in: data.expires_in,
            },
            { new: true, upsert: true },
            (err, data) => {
              if (err) throw err;
              // console.log({ token: data });
            }
          );
        }
        //  console.log({ htoken: data });
        let token = encryptData(updateOrCreateUser);
        res.cookie("hvrif", token);
        // console.log(dynamics365Authentication(updateOrCreateUser._id));
        // res.redirect("/login");
        res.redirect("/appdashboard" + `?hvrif=${encodeURIComponent(token)}&plat=${encodeURIComponent(process.env.PLATFORM)}`);
      });
    }
  } catch (error) {
    console.log(error.response);
    return res.send({ success: false, error });
  }
};
exports.refreshHubSpotToken = async (req, res, next) => {
  try {
    //console.log("Autenticationcontroller Refreshing HubSpot Token");
    let hoautk = await tokens
      .findOne({
        tokenname: "hoautk",
        user_id: global.user._id,
        platform: "dshubspotosage",
      })
      .lean();
    let isExpired = isTokenExpired(hoautk);
    console.log({ isExpired });
    if (isExpired) {
      if (hoautk) {
        var data = qs.stringify({
          client_id: process.env.HUBSPOT_CLIENT_ID,
          client_secret: process.env.HUBSPOT_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: decryptData(hoautk.refresh_token).data,
        });
        var config = {
          method: "post",
          url: "https://api.hubapi.com/oauth/v1/token",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: data,
        };

        const result = await axios(config);
        if (result.data && result.data.access_token) {
          tokens.findOneAndUpdate(
            {
              tokenname: "hoautk",
              user_id: global.user._id,
              platform: process.env.PLATFORM,
            },
            {
              tokenname: "hoautk",
              user_id: global.user._id,
              platform: process.env.PLATFORM,
              access_token: encryptData({ data: result.data.access_token }),
              refresh_token: encryptData({ data: result.data.refresh_token }),
              access_token_expire_in: result.data.expires_in,
              refresh_token_expire_in: result.data.expires_in,
            },
            { new: true, upsert: true },
            (err, data) => {
              if (err) throw err;
              // console.log({ token: data });
            }
          );
          console.log({ refreshToken: result.data });
          console.log("HubSpot Token Refreshed");
          // res.cookie("hoautk", encryptData({ data: result.data.access_token }));
          // res.cookie(
          //   "hoaurtk",
          //   encryptData({ data: result.data.refresh_token })
          // );
          res.cookie("hvrif", encryptData(global.user));
          return res.redirect("/after-authentication");
        }
      } else {
        next(new ErrorResponse("HubSpot Token Not Verified", "500", "Hubspot Authetication"));
      }
    } else {
      console.log("Token Not Expired Yet");
      next();
    }
  } catch (error) {
    tokens.findOneAndRemove(
      {
        tokenname: "hoautk",
        user_id: global.user._id,
        platform: "dshubspotosage",
      },
      (err, res) => { }
    );
    return res.redirect("/api/auth/hubspot");
    // return { success: false, error };
  }
};

exports.getHubSpotAccountDetails = async (req, res, next) => {
  try {
    let user = req.dsuser;
    let get_owner_account_data = await axios.get(`${process.env.HUBSPOT_API_URL}/crm/v3/owners/?email=${user.email}`, {
      headers: {
        Authorization: `Bearer ${user.hoautk}`,
      },
    });
    // Getting Owner Account User Details
    if (get_owner_account_data.status == 200)
      get_owner_account_data = JSON.parse(JSON.stringify(get_owner_account_data.data.results[0]));
    delete user.password;
    // let syncinglogs = await hubsagefields.find({ user_id: user._id }).lean();
    let syncinglogs = await hubsagefields.find({}).sort({ createdAt: -1 }).lean();
    let newsynclogs = [];
    await Promise.all(
      syncinglogs.map((mp) => {
        if (mp.email)
          newsynclogs.push({
            email: mp.email,
            ago: moment(mp.createdAt).fromNow(),
          });
      })
    );
    return res.send({ success: true, data: { ...get_owner_account_data, ...user, synclogs: newsynclogs } });
  } catch (error) {
    console.log(error);
    next(new ErrorResponse("Account not found", "500", "Hubspot Authetication"));
    return res.send({ success: false, error: "Account not found" });
  }
};




