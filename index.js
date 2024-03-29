require("update-electron-app")();

const { menubar } = require("menubar");

const path = require("path");
const {
  app,
  nativeImage,
  Tray,
  Menu,
  globalShortcut,
  shell,
} = require("electron");
const contextMenu = require("electron-context-menu");

const image = nativeImage.createFromPath(
  path.join(__dirname, `images/newiconTemplate.png`)
);

app.on("ready", () => {
  const tray = new Tray(image);
// Menubar 
  const mb = menubar({
    browserWindow: {
      icon: image,
      transparent: path.join(__dirname, `images/iconApp.png`),
      webPreferences: {
        webviewTag: true,
        // nativeWindowOpen: true,
      },
      width: 450,
      height: 550,
    },
    tray,
    showOnAllWorkspaces: true,
    preloadWindow: true,
    showDockIcon: false,
    icon: image,
  });

  mb.on("ready", () => {
    const { window } = mb;
    if (process.platform !== "darwin") {
      window.setSkipTaskbar(true);
    } else {
      app.dock.hide();
    }
    const contextMenuTemplate = [
       {
        label: "Reload",
        accelerator: "Control+R",
        click: () => {
          window.reload();
        },
      },
      {
        label: "Quit",
        accelerator: "Control+Q",
        click: () => {
          app.quit();
        },
      },
      {
        label: "Open in browser",
        click: () => {
          shell.openExternal("https://chat.openai.com/chat");
        },
      },
      {
        type: "separator",
      },
    ];
// tray
    tray.on("right-click", () => {
      mb.tray.popUpContextMenu(Menu.buildFromTemplate(contextMenuTemplate));
    });

    tray.on("click", (e) => {
      //check if ctrl or meta key is pressed while clicking
      e.ctrlKey || e.metaKey
        ? mb.tray.popUpContextMenu(Menu.buildFromTemplate(contextMenuTemplate))
        : null;
    });
    const menu = new Menu();
    globalShortcut.register("Control+Shift+a", () => {
      if (window.isVisible()) {
        mb.hideWindow();
      } else {
        mb.showWindow();
        if (process.platform == "darwin") {
          mb.app.show();
        }
        mb.app.focus();
      }});
   Menu.setApplicationMenu(menu);
    console.log("Menubar app is ready.");
  });
  app.on("web-contents-created", (e, contents) => {
    if (contents.getType() == "webview") {
      // open link with external browser in webview
      contents.on("new-window", (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
      });
      contextMenu({
        window: contents,
      });
      contents.on("before-input-event", (event, input) => {
        const { control, meta, key } = input;
        if (!control && !meta) return;
        if (key === "c") contents.copy();
        if (key === "v") contents.paste();
        if (key === "a") contents.selectAll();
        if (key === "z") contents.undo();
        if (key === "y") contents.redo();
        if (key === "q") app.quit();
        if (key === "r") contents.reload();
      }
      );}});

  if (process.platform == "darwin") {
    // restore focus to previous app on hiding
    mb.on("after-hide", () => {
      mb.app.hide();});
    }
  app.commandLine.appendSwitch(
    "disable-backgrounding-occluded-windows",
    "true");}
    );

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();}}
    );
