module.exports = app => {
  const {router, controller} = app;

  router.get('/project/query', controller.project.index.query);
  router.get('/project/preview', controller.project.index.preview);
  router.post('/project/updateConfig', controller.project.index.updateConfig);
  router.post('/project/release', controller.project.index.release);
  router.post('/project/createProject', controller.project.index.createProject);
}