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

async function GenRepo(id, Update = false) {
    try {
        const data = Update ? await RepoSchema.findOne({ id: id }) : new RepoSchema({ id: id });

        if (!data) throw new Error('Could not find or create data for id: ' + id);
        
        const [UserRepos, OrgRepos] = await Promise.all([GetUserRepos(), GetOrgsRepos()]);

        data.UserRepos = UserRepos;
        data.OrgRepos = OrgRepos;
        await data.save();

        return true;
    } catch (err) {
        console.log(err)
    }
}


async function getRepoDetails(owner, repo) {
    try {
        const commonOptions = {
            headers: {
                'accept': 'application/vnd.github+json',
                'Authorization': `token ${token}`
            },
            data: {
                per_page: 100,
                page: 1
            }
        };

        const issuesUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
        const issuesOptions = { ...commonOptions, data: { ...commonOptions.data, state: 'all', sort: 'created', direction: 'desc' } };
        const issues = await RequestGithub(issuesUrl, issuesOptions);

        const branchesUrl = `https://api.github.com/repos/${owner}/${repo}/branches`;
        const branchesOptions = { ...commonOptions };
        const branches = await RequestGithub(branchesUrl, branchesOptions);

        const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
        const commitsOptions = { ...commonOptions };
        const commits = await RequestGithub(commitsUrl, commitsOptions);

        const releasesUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
        const releasesOptions = { ...commonOptions };
        const releases = await RequestGithub(releasesUrl, releasesOptions);

        const pullRequestsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;
        const pullRequestsOptions = { ...commonOptions, data: { ...commonOptions.data, state: 'all', } };
        const pullRequests = await RequestGithub(pullRequestsUrl, pullRequestsOptions);

        return {
            issues,
            branches,
            commits,
            releases,
            pullRequests,
        };

    } catch (err) {
        console.log(err);
    }
}


module.exports = { GenRepo, RequestGithub, getRepoDetails };