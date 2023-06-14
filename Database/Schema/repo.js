const mongoose = require("mongoose");

module.exports = mongoose.model("Repo", new mongoose.Schema({
    id: { type: String, default: null },
    UserRepos: { type: Array, default: [] },
    OrgRepos: { type: Array, default: [] },
 }));