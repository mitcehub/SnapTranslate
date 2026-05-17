function initBackground() {
  setMessageHandler((req, sender, respond) => {
    return handleMessage(req, sender, respond);
  });
  initRules();
}
