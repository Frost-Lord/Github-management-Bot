UserSchema = require("./Schema/user.js"),
DocsSchema = require("./Schema/docs.js"),
AdminSchema = require("./Schema/admin.js"),
RepoSchema = require("./Schema/repo.js"),

module.exports.fetchrepos = async function(key){

    let users = await RepoSchema.findOne({ id: key });

    if(users){
        return users;
    }else{
        users = new RepoSchema({
            id: key,
            registeredAt: Date.now()
        })
        await users.save().catch(err => console.log(err));
        return users;
    }
};