const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    reset_password_token: {
      type: String,
      default: "",
    },
    token_used: {
      type: String,
      default: "",
    },
    mobile_no: {
      type: String,
    },
    invoice_object_name: {
      type: String,
    },
    hub_domain: String,
    hub_id: String,
    app_id: String,
    user_id: String,
    token_type: String,
    hubdealtosage: {
      type: Boolean,
      default: false,
    },
    lastEmailSyncTime: {
      type: Number,
    },
    autoSyncing: {
      type: Boolean,
      default: true,
    },
    lastcronrundatecompany:{
      type:Date,default:Date.now()
    },
    lastcronrundatecontact:{
      type:Date,default:Date.now()
    },
    lastcronrundatesalesorder:{
      type:Date,default:Date.now()
    },
    lastcronrundateinvoice:{
      type:Date,default:Date.now()
    },
    lastcronrundateinventory:{
      type:Date,default:Date.now()
    },
    AllSyncingStatus: {
      type: Boolean,
      default: false,
    },
    DealSyncingStatus: {
      type: Boolean,
      default: false,
    },
    InvoicesSyncingStatus: {
      type: Boolean,
      default: false,
    },
    ProductSyncingStatus: {
      type: Boolean,
      default: false,
    },
    EmailSyncingStatus: {
      type: Boolean,
      default: false,
    },
    settings: {},

  },
  { timestamps: true, versionKey: false }
);

module.exports = User = mongoose.model("User", UserSchema);
