const snowflake = require('snowflake-sdk');
const axios = require('axios')
var base64 = require('base-64');
var utf8 = require('utf8');
const util = require("../utils/util");
const https = require('https');
const csv = require("csvtojson");
const { parse } = require('fast-csv');
const { Connection, Request } = require("tedious");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const mongoose = require('mongoose');
const {
  tokens, secondsnowflakechains,
  userregister,
  hubsagedynamicoptions,
  secondsnowflakechannels,
  spacecontactsdata,
  AvCostomers,
  spacecoustomersdata,
  spacebookigsdata,
  spacenotesdata,
  User


} = require("../models");
const fs = require('fs');
const { use } = require('../router/route');

async function asyncforEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.viewlogs = async function (req, res, id) {

  const logId = req.params.id;
  console.log("hello", logId)
  let logdata = await logs.find({ "_id": logId }).lean();
  // console.log("logdata",logdata[0].message)
  return res.status(201).json({ logdata })

};


///Active owner page view
exports.activeOwner = async function (req, res, id) {

  try {
    let user = req.dsuser;

    res.render("activeowner"
    );
  } catch (error) {
  }
}

exports.EmailSetting = async function (req, res, id) {

  try {
    let user = req.dsuser;
    res.render("settingCon"
    );
  } catch (error) {
  }
}


exports.saveEmailSetting = async (req, res, next) => {
  const { smpt, HostName, port, from, user, password } = req.body;
  console.log(smpt, HostName, port, from, user, password);
  let mongouser = await User.findOne({});
  console.log("user-details", mongouser);




}
















