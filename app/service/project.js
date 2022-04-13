const Service = require('egg').Service;
const { Octokit } = require("@octokit/core");
const download = require('download-git-repo');
const utils = require('../utils/fileUtils');
const fs = require('fs');
const process = require('child_process');
const octokit = new Octokit({ auth: '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' });

function downloadFunc(downloadRepoUrl, temp_dest) {
  return new Promise(async (resolve, reject) => {
    console.log('downloadRepoUrl', downloadRepoUrl);
    console.log('temp_dest', temp_dest);
    download(downloadRepoUrl + '#main', temp_dest, (err) => {
      if (err) {
        console.log(err);
        reject('template dowload fail!');
      } else {
        resolve('template dowload success!');
      }
    })
  });
}

async function release(repoUrl, repoName) {
  console.log('repoUrl', repoUrl)
  console.log('repoName', repoName)
  try {
    process.execSync(
      [
        `cd static/${repoName}/dist`,
        `git init`,
        `git checkout -b gh-pages`,
        `git remote add origin ${repoUrl}`,
        `git add -A`,
        `git commit -m 'deploy'`,
        `git push -f origin gh-pages`,
        `cd -` // 回到最初目录 liunx
      ].join(' && ')
    )
  } catch (e) {
    console.log('error');
  } finally {
    process.exec([
      `cd static`,
      `rm -rf ${repoName}`, // linux
      // `rd /s /q ${repoName} ` // window
    ].join(' && '), error => {
      if (error) {
        console.log('清除模板失败！', error)
      }
    })
  }
}

async function renderTpl({ templateGit, name: repoName, data, repoUrl, templateConfig }) {
  if (!(await utils.existOrNot('./static'))) {
    await utils.mkdirFolder('static');
  }

  // 基础模版所在目录，如果是初始化，则是模板名称，否则是项目名称
  const temp_dest = `static/${templateConfig.templateName || repoName}`;

  // 下载模板
  if (!(await utils.existOrNot(temp_dest))) {
    await downloadFunc(templateConfig.git || repoUrl, temp_dest);
  }

  // 注入数据
  const res = fs.readFileSync(`${temp_dest}/dist/index.html`, 'utf-8');
  let target = res.replace(
    /(?<=<script data-inject>).*?(?=<\/script>)/,
    `window.__coco_config__= ${JSON.stringify({
      ...data,
      components: data.userSelectComponents
    })}`
  );

  target = target.replace(/(?<=<title>).*?(?=<\/title>)/, data.config.projectName);

  fs.writeFileSync(`${temp_dest}/dist/index.html`, target);

  await release(repoUrl, templateConfig.templateName || repoName);

  return Promise.resolve({});
}

async function isExistProject(owner, repo) {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo
    })
    return data
  } catch (error) {
    return false
  }
}

class ProjectService extends Service {
  async createProject(config) {
    let id, ssh_url;
    // 判断是否已经存在项目，存在则不创建
    const data = await isExistProject('mumu-page', config.name)
    if (data) {
      id = data.id
      ssh_url = data.ssh_url
    } else {
      // 创建项目
      const { data } = await octokit.request('POST /orgs/{org}/repos', {
        org: 'mumu-page',
        name: config.name
      });
      id = data.id
      ssh_url = data.ssh_url
    }

    await renderTpl({
      ...config,
      repoUrl: ssh_url
    });
    return { id, ssh_url }
  }
}

module.exports = ProjectService;
