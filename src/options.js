const validator = new ContentFarmFilter();

function loadOptions() {
  return utils.getDefaultOptions().then((options) => {
    document.querySelector('#userBlacklist textarea').value = options.userBlacklist;
    document.querySelector('#userWhitelist textarea').value = options.userWhitelist;
    document.querySelector('#webBlacklists textarea').value = options.webBlacklists;
    document.querySelector('#displayContextMenusOptions').checked = options.displayContextMenusOptions;

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        cmd: 'getMergedBlacklist',
      }, resolve);
    }).then((blacklist) => {
      document.querySelector('#allBlacklist textarea').value = blacklist;
    });
  }).catch((ex) => {
    console.error(ex);
  });
}

function saveOptions() {
  const userBlacklist = document.querySelector('#userBlacklist textarea').value;
  const userWhitelist = document.querySelector('#userWhitelist textarea').value;
  const webBlacklists = document.querySelector('#webBlacklists textarea').value;
  const displayContextMenusOptions = document.querySelector('#displayContextMenusOptions').checked;

  return utils.setOptions({
    userBlacklist: validator.validateRulesText(userBlacklist),
    userWhitelist: validator.validateRulesText(userWhitelist),
    webBlacklists: webBlacklists,
    displayContextMenusOptions: displayContextMenusOptions,
  }).then(() => {
    if (history.length > 1) {
      history.go(-1);
    } else {
      chrome.tabs.getCurrent((tab) => {
        chrome.runtime.sendMessage({
          cmd: 'closeTab',
          args: {tabId: tab.id}
        });
      });
    }
  }).catch((ex) => {
    console.error(ex);
  });
}

document.addEventListener('DOMContentLoaded', (event) => {
  utils.loadLanguages(document);

  loadOptions();

  document.querySelector('#resetButton').addEventListener('click', (event) => {
    event.preventDefault();
    utils.clearOptions().then(() => {
      return loadOptions();
    });
  });

  document.querySelector('#submitButton').addEventListener('click', (event) => {
    event.preventDefault();
    saveOptions();
  });

  /**
   * NodeList.prototype.forEach()
   * Chrome >= 51, Fx >= 50
   *
   * Following makes sure saveOptions work fine
   */
  document.querySelectorAll('.tab-link').forEach(el => {
    el.addEventListener('click', () => {
      event.preventDefault();
      location.replace(el.href);
    });
  })

  if (!location.hash) {
    location.replace('#tab0');
  }
});
