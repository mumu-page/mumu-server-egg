const Controller = require('egg').Controller;


class ProjectController extends Controller {

  async createProject() {
    const {params, model, service} = this.ctx;
    const {pageConfig} = params;
    console.log('pageConfig', pageConfig);
    const {
      gitName: name,
      templateName,
      templateGit,
      templateId,
      version,
    } = pageConfig.config;

    // todo 重要： 本地环境记得注释回回来！！！
    // 创建项目
    // github 上创建项目
    const result = await service.project.createProject({
      ...pageConfig.config,
      name,
      data: pageConfig,
      templateConfig: {
        templateName,
        git: templateGit,
      }
    });
    // todo 重要：本地环境注释，result为mock结果
    // const result = {}

    // 数据库存储项目基础信息
    const project = await model.Project.create({
      templateId,
      name,
      pageConfig: JSON.stringify(pageConfig),
      gitConfig: JSON.stringify(result),
      version,
    });

    this.ctx.body = new ResponseUtil().ok(project)
  }

  async query() {
    const {
      id,
    } = this.ctx.params;
    const where = {};
    if (id) where.id = id;
    const result = await this.ctx.service.project.query(where)
    this.ctx.body = {
      success: true,
      result
    }
  }

  async preview() {
    const {
      id,
    } = this.ctx.params;
    const where = {
      id,
    };
    const {dataValues: project} = await this.ctx.model.Project.findOne({
      where,
    });
    const page = JSON.parse(project.pageConfig)
    this.ctx.body = {
      success: true,
      result: {
        ...page,
        components: page.userSelectComponents,
        pageData: page.config,
      },
    }
  }

  async updateConfig() {
    const {params, model} = this.ctx;
    const {pageConfig, id} = params;
    const {
      gitName: name,
      templateId,
      version,
    } = pageConfig.config;
    const project = await model.Project.update({
      templateId,
      name,
      pageConfig: JSON.stringify(pageConfig),
      version,
    }, {
      where: {
        id
      }
    });

    this.ctx.body = {
      success: true,
      message: '项目保存成功'
    }
  }

  async release() {
    const {params, service} = this.ctx;
    const {id} = params;
    const where = {};
    if (id) where.id = id;
    const projects = await this.ctx.service.project.query(where)
    const {pageConfig} = projects && projects[0] || {};
    const {
      gitName: name,
      templateName,
      templateGit,
    } = pageConfig && pageConfig.config || {};

    const result = await service.project.release({
      ...pageConfig.config,
      name,
      data: pageConfig,
      templateConfig: {
        templateName,
        git: templateGit,
      }
    });
    if(result) {
      return this.ctx.body = {
        success: true,
        result: `https://mumu-page.github.io/${name}`,
      }
    }
    this.ctx.body = {
      success: false,
      message: '发布失败',
      result
    }
  }
}

module.exports = ProjectController;
