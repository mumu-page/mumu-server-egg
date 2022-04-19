const Controller = require('egg').Controller;
const ResponseUtil = require('../../utils/response');

class TemplateController extends Controller {
  async query() {
    const {
      id,
      gitUrl,
    } = this.ctx.params;
    const where = {};
    if (id) where.id = id;
    if (gitUrl) where.gitUrl = gitUrl;
    const result = await this.ctx.model.Template.findAll({
      where
    });
    this.ctx.body = new ResponseUtil().ok(result)
  }

  async updateTemplate() {
    const { params } = this.ctx;
    const { name, gitUrl } = params;
    const { model } = this.ctx;
    if (gitUrl && name) {
      try {
        const result = await model.Template.findOne({
          where: {
            gitUrl
          }
        })
        if (result) {
          await model.Template.update(params, {
            where: {
              gitUrl
            }
          })
          const result = await model.Template.findOne({
            where: {
              gitUrl
            }
          })
          this.ctx.body = new ResponseUtil().ok(result)
        } else {
          const result = await model.Template.create({
            ...params,
            type: 0,
          });
          this.ctx.body = new ResponseUtil().ok(result)
        }
      } catch (e) {
        this.ctx.body = new ResponseUtil().fail(e)
      }
    } else {
      this.ctx.body = 500;
      this.ctx.body = new ResponseUtil().fail('gitUrl || name 必填')
    }
  }
}

module.exports = TemplateController;
