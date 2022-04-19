class ResponseUtil {
    success = false;
    message = ''
    data = {}
    constructor(success, message, data) {
        this.success = success
        this.message = message
        this.data = data
    }

    ok(data, message) {
        this.success = true
        this.data = data
        this.message = message || '操作成功';
        return this
    }

    fail(data, message) {
        this.success = false
        this.data = data || null
        this.message = message || '操作失败';
        return this
    }
}

module.exports = ResponseUtil;