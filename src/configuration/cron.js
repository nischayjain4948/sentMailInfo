var CronJob = require("cron").CronJob;
const croncontroller = require("../controller/croncontroller");
const { userregister } = require("../models");
const later = require("later");
exports.runCron = () => {
  var job = new CronJob(
    "*/1 * * * *",
    async function () {
      let users = await userregister.find().lean();
      if (users.length > 0) {
        for (const user of users) {
       //   console.log("User Email : ", user.email);
          let cron = new croncontroller(user);
          cron.refreshHubSpotToken(user).then((result) => {
            if (result.success) {
              console.log(
                `HubSpot  Tokens Refreshed by Cron for  ${user.email}`
              );
            } else {
              console.log(`HubSpot Token not Refreshed for  ${user.email}`);
            }
          });
       
        }
      }
     
    },
    null,
    true
  );
  job.start();

  

  




  new CronJob(
    "46 12 22 * *",
    async function () {
      let users = await userregister.find().lean();
      if (users.length > 0) {
        for (const user of users) {
          let cron = new croncontroller(user);
          cron.refreshTokens(user).then((result) => {
            if (result.success) {
            if (user.AllSyncingStatus) {
              cron.DeleteLastSevenDaysData(user).then(() => {
                 console.log("******** connectSnowFlake_ChannelManager  Syncing Done ********");
              });
            }
            //   cron.connectSnowFlake_Contacts(user).then(() => {
            //     console.log("******** connectSnowFlake_Contacts Syncing Done ********");
            //  });
            }
          });
        }
      }
    },
    null,
    true
  ).start();



  

  




};
