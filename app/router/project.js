module.exports = app => {
  const {router, controller} = app;

  router.get('/project/query', controller.project.index.query);
  router.post('/project/preview', controller.project.index.preview);
  router.post('/project/updateConfig', controller.project.index.updateConfig);
  router.post('/project/createProject', controller.project.index.createProject);
}