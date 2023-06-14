const RepoSchema = require("../../Database/Schema/repo.js")
const axios = require('axios');
const token = process.env.GITHUB_TOKEN;

async function RequestGithub(url, options) {
    try {
        const res = await axios.get(url, options)
        return res.data
    } catch (err) {
        console.log(err)
    }
}
async function GetOrgsRepos() {
    const orgsUrl = `https://api.github.com/user/orgs`;
    const orgsOptions = {
        headers: {
            'accept': 'application/vnd.github+json',
            'Authorization': `token ${token}`
        }
    };
    const orgs = await RequestGithub(orgsUrl, orgsOptions);
    const orgRepos = {};
    for (const org of orgs) {
        const reposUrl = `https://api.github.com/orgs/${org.login}/repos`;
        const reposOptions = {
            headers: {
                'accept': 'application/vnd.github+json',
                'Authorization': `token ${token}`
            },
            data: {
                org: 'ORG',
                type: 'all',
                sort: 'created',
                direction: 'desc',
                per_page: 100,
                page: 1
            }
        };
        const repos = await RequestGithub(reposUrl, reposOptions);
        orgRepos[org.login] = repos;
    }
    return orgRepos;
}


async function GetUserRepos() {
    const url = `https://api.github.com/user/repos`;
    const options = {
        headers: {
            'accept': 'application/vnd.github+json',
            'Authorization': `token ${token}`
        },
        data: {
            type: 'all',
            sort: 'created',
            direction: 'desc',
            per_page: 30,
            page: 1,
            visibility: 'all'
        }
    };
    const userRepos = await RequestGithub(url, options);
    return userRepos;
}

async function GenRepo(id, user, org) {
    try {
        const UserRepos = await GetUserRepos(user)
        const OrgRepos = await GetOrgsRepos(org)

        new RepoSchema({
            id: id,
            UserRepos: UserRepos,
            OrgRepos: OrgRepos
        }).save()
        return true
    } catch (err) {
        console.log(err)
    }
}

module.exports = { GenRepo, RequestGithub }