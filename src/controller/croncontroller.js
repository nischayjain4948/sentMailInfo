const qs = require("qs");
var mongoose = require("mongoose");
const snowflake = require("snowflake-sdk");
const util = require("../utils/util");
const { Connection, Request } = require("tedious");
const converter = require("json-2-csv");
const fs = require("fs");
path = require("path");
const axios = require("axios");
const moment = require("moment");
const nodemailer = require("nodemailer");
// var filePath = path.resolve("src/Email_Sent_Log_Files");
const { encryptData, decryptData, isTokenExpired } = require("../utils/util");
var rate = 2000; // in milliseconds
var throttle = require("promise-ratelimit")(rate);
const _ = require("underscore");
const {
  tokens,
  customerdailycreate,
  contactdailycreate,
  salesorderdailycreate,
  inventorydailycreate,
  compareallinvoice,
  allinvoice,
  compareallsalesorder,
  allsalesorder,
  compareallcontacts,
  compareallcustomers,
  userregister,
  hubsagedynamicoptions,
  logs,
} = require("../models");
const { Console } = require("console");
const { cpuUsage } = require("process");
const AudienceMappingController = new (require("./emailMappingController"))();

async function asyncforEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


class CronController {
  constructor(user) {
    this.user = user;
  }
  async refreshHubSpotToken(requser) {
    try {
      // console.log("Refreshing HubSpot Token");
      let user = requser;
      if (user && user.email) {
        let getUser = await userregister.findOne({ email: user.email });
        if (!getUser) {
          return {
            success: false,
            error: "Authentication Failed",
          };
        }
      } else {
        return {
          success: false,
          error: "Authentication Failed",
        };
      }

      let hoautk = await tokens.findOne({
        tokenname: "hoautk",
        user_id: user._id,
        platform: process.env.PLATFORM,
      });
      if (hoautk) {
        let isExpired = isTokenExpired(hoautk);
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
                  user_id: user._id,
                  platform: process.env.PLATFORM,
                },
                {
                  tokenname: "hoautk",
                  user_id: user._id,
                  platform: process.env.PLATFORM,
                  access_token: encryptData({ data: result.data.access_token }),
                  refresh_token: encryptData({
                    data: result.data.refresh_token,
                  }),
                  access_token_expire_in: result.data.expires_in,
                  refresh_token_expire_in: result.data.expires_in,
                },
                { new: true, upsert: true },
                (err, data) => {
                  if (err) throw { success: false, error: err };
                  // console.log({ token: data });
                  // console.log({ htoken: result.data });
                  // console.log("HubSpot Token Refreshed");
                }
              );
              return { success: true, data: result.data };
            }
          } else {
            return { success: false, error: "HubSpot Token Not Verified" };
          }
        } else {
          return { success: true, data: "Not Expired Token Working" };
        }
      } else {
        return {
          success: false,
          error: "Hoautk not defined",
        };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  async asyncforEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }


  async refreshTokens(users) {
    try {
      const hubToken = await this.refreshHubSpotToken(users);
      // console.log({ hubToken });
      if (hubToken.success) {
        return { success: true, data: "Hubtoken Success" };
      } else {
        return { success: false, error: "HubToken Not Refreshed" };
      }
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  }

  /////delete all integration data all table last 7 days
  async DeleteLastSevenDaysData(user) {
    // let Customer = await customerdailycreate.remove({ "createdAt": { "$lt": new Date(new Date().setDate(new Date().getDate() - 7)) } }).lean();
    // let Contact = await contactdailycreate.remove({ "createdAt": { "$lt": new Date(new Date().setDate(new Date().getDate() - 7)) } }).lean();
    // let Salesorder = await salesorderdailycreate.remove({ "createdAt": { "$lt": new Date(new Date().setDate(new Date().getDate() - 7)) } }).lean();
    // let Inventory = await inventorydailycreate.remove({ "createdAt": { "$lt": new Date(new Date().setDate(new Date().getDate() - 7)) } }).lean();
    let value = "depa";
    let length = value.length;
    let characterCounts = {};

    for (let i = 0; i < length; i++) {
      let character = value.charAt(i);
      if (characterCounts[character]) {
        characterCounts[character]++;
      } else {
        characterCounts[character] = 1;
      }
    }

    console.log("Length of the string:", length);
    console.log("Character counts:", characterCounts);

    let valuee = "dpea";
    let lengths = valuee.length;
    let characterCountss = {};

    for (let j = 0; j < lengths; j++) {
      let characters = valuee.charAt(j);
      if (characterCountss[characters]) {
        characterCountss[characters]++;
      } else {
        characterCountss[characters] = 1;
      }
    }
    console.log("Length of the string:", lengths);
    console.log("Character counts:", characterCountss);

    if (length === lengths) {
      console.log("yes")
      let areEqual = true;

      // Iterate over the properties of obj1 and compare them with obj2
      for (let key of obj1Keys) {
        if (characterCounts[key] !== characterCountss[key]) {
          areEqual = false;
          break;
        }
      }

      if (areEqual) {
        console.log("The objects are equal.");
      } else {
        console.log("The objects are not equal.");
      }
    }
    else {
      console.log("no")
    }
  }
}

module.exports = CronController;
