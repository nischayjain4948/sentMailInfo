const {
  userregister,

  tokens: UserToken,
  logs,

  hubsagedynamicoptions,
  hubsagefields,
} = require("../models");
const bcrypt = require("bcryptjs");
const util = require("../utils/util");
const ErrorResponse = require("../utils/ErrorRespnse");
var mongoose = require("mongoose");
const axios = require("axios");
const moment = require("moment");
const strings = require("../configuration/variables");
const { post } = require("jquery");
const { mapReduce } = require("../models/tokens");

var rate = 1000; // in milliseconds
var throttle = require("promise-ratelimit")(rate);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


/**
 * @preferences
 * @Bidirection 1
 * @PrefrenceHubSpot 2
 * @PrefrenceMercury 3
 */
let calls = {};
function createcallCounts(call) {
  calls[call["name"]] = {
    method: call["method"],
    count: calls[call["name"]] ? calls[call["name"]]["count"] + 1 : 1,
  };
  console.log(getCallCount(call));
  return getCallCount(call);
}
function getCallCount(call) {
  if (calls[call["name"]] && calls[call["name"]]["count"]) {
    return calls[call["name"]]["count"];
  } else return 0;
}

module.exports = class AudienceMappingController {



  async contactdashboard(req, res, next) {

    try {
      let user = req.dsuser;
      let customerdatafordropdown;
      var contact_property_options = [];
      var optionsofhubsage = await hubsagedynamicoptions.findOne({
        user_id: user._id,
        type: "ContactSyncing",
      });
      //console.log("strings.COMPANY_pRO", strings.COMPANY_pRO);

      let getcustomer = await axios.get(
        `${process.env.myenergycodeURL}/customer/Contact?customerCode=CUST-000003`,
        {
          headers: {
            Authorization:
              `${process.env.myenergycode}`,
          },


        }
      );
      //   console.log("getcustomer",getcustomer.data.data[0].attributes)
      if (
        getcustomer &&
        getcustomer.status == 200 &&
        getcustomer.data

      ) {
        customerdatafordropdown = getcustomer.data.data[0].attributes
        // console.log("customerdatafordropdown",customerdatafordropdown)
        var sageFields = Object.keys(customerdatafordropdown)

      }
      var hubSageFields = [
        { hub: "Name", sage: "Name" },
      ];

      var hubSagelookupFields = [
        { hub: "Client Country List", sage: "Address1 Country" },
        { hub: "Client State List", sage: "Mercury Address1 State " },
      ];

      let hoautk = await UserToken.findOne({
        tokenname: "hoautk",
        user_id: user._id,
        platform: process.env.PLATFORM,
      }).lean();

      let isExpiredhoautk = util.isTokenExpired(hoautk);

      let update_tokens = {};
      if (hoautk && !isExpiredhoautk) {
        var options = {
          method: "GET",
          url: "https://api.hubapi.com/properties/v1/contacts/properties",
          headers: {
            Authorization: `Bearer ${util.decryptData(hoautk.access_token).data
              }`,
          },
        };
        const result = await axios(options);
        if (result.data && result.data.length > 0) {
          result.data.forEach((mp) => {
            contact_property_options.push(mp.name);
            if (mp.formField) {
            }
          });
        }
        //console.log("contact_property_options",contact_property_options)
        // console.log("sageFields",sageFields)
        update_tokens = {
          optionsofhubsage,
          autoSyncing: user.autoSyncing,
        };
      }
      // console.log("options",contact_property_options)
      //console.log("sageFields",sageFields)
      res.render("contact", {
        store: update_tokens,
        options: contact_property_options.sort((a, b) => a.localeCompare(b)),
        sageFields: sageFields.sort((a, b) => a.localeCompare(b)),
        hubSageFields,
        hubSagelookupFields,
      });
    } catch (error) {
      res.render("contact", {
        store: {},
        options: {},
        sageFields: {},
        hubSageFields: [],
      });
    }
  }

  /**
   * @path /api/
   * @description Save Hubsage Options
   */

  //mapping save  in Hubspot
  async saveHubsageOptions(req, res) {
    try {
      let data = req.body;
      let user = req.dsuser;

      let huboptions = await hubsagedynamicoptions.findOneAndUpdate(
        {
          user_id: user._id,
          type: "ContactSyncing",
          platform: process.env.PLATFORM,
        },
        { user_id: user._id, type: "ContactSyncing", ...data },
        { upsert: true, new: true }
      );
      if (huboptions)
        return res.send({ success: true, data: "Successfully saved options" });
      else return res.send({ success: false, error: "Options not saved" });
    } catch (error) {
      console.error(error);
    }
  }



};

