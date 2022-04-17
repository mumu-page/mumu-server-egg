const Service = require('egg').Service;
const { Octokit } = require("@octokit/core");
const download = require('download-git-repo');
const utils = require('../utils/fileUtils');
const fs = require('fs');
const process = require('child_process');
const octokit = new Octokit({ auth: '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' });

function downloadFunc(downloadRepoUrl, temp_dest) {
  console.log('开始下载模版...')
  return new Promise(async (resolve, reject) => {
    download(downloadRepoUrl + '#main', temp_dest, (err) => {
      if (err) {
        reject('模板下载失败!');
      } else {
        console.log('模板下载成功!')
        resolve();
      }
    })
  });
}

async function release(repoUrl, repoName) {
  console.log('开始上传模版...')
  try {
    process.execSync(
      [
        `cd static/${repoName}/dist`,
        `git init`,
        `git remote add origin ${repoUrl}`,
        `git add -A`,
        `git commit -m 'deploy'`,
        `git branch gh-pages`,
        `git checkout gh-pages`,
        `git push -f origin gh-pages`,
        `cd -` // 回到最初目录 liunx
      ].join(' && ')
    )
  } catch (e) {
    console.log('release error');
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
    /(?<=<script data-inject>)(.|\n)*?(?=<\/script>)/,
    `window.__mumu_config__= ${JSON.stringify({
      ...data,
      components: data.userSelectComponents
    })}`
  );

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
    // console.log('error', error)
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

  async release(config) {
    // 判断是否存在项目
    const data = await isExistProject('mumu-page', config.name)
    if (!data) return null

    await renderTpl({
      ...config,
      repoUrl: data.ssh_url
    });
    return data
  }

  async query(where = {}) {
    const result = await this.ctx.model.Project.findAll({
      where,
      order: [
        // 将转义 title 并针对有效方向列表进行降序排列
        ['updatedAt', 'DESC'],
      ]
    })
    result.forEach(project => {
      project.pageConfig = JSON.parse(project.pageConfig)
      project.gitConfig = JSON.parse(project.gitConfig)
      project.releaseInfo = JSON.parse(project.releaseInfo)
    })
    return result
  }
}

module.exports = ProjectService;
