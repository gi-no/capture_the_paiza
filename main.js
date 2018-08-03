"use strict";
const electron        = require("electron");
const {app, BrowserWindow, ipcMain, shell} = electron;
const fse = require('fs-extra')
initialize_env();
const screen_shot_util = require('./index.js');

global.mainWindow = null;

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  electron.session.defaultSession.clearCache(() => {});
  app.quit();
});

app.on('activate', () => {
  createWindow();
});

function createWindow() {
  if(global.mainWindow !== null ) {
    return;
  }
  global.mainWindow = new BrowserWindow({width: 350, height: 700});

  global.mainWindow.loadURL('file://' + __dirname + '/index.html');
  global.mainWindow.webContents.session.clearCache(function() {});

  // global.mainWindow.webContents.openDevTools();

  // ウィンドウが閉じられたらアプリも終了
  global.mainWindow.on('closed', () => global.mainWindow = null );
}

ipcMain.on('take_screen_shots', (event, arg) => {
  screen_shot_util.take_all_screen_shot();
});

ipcMain.on('open_origin_directory', (event, arg) => {
  shell.showItemInFolder(app.getPath('userData') + '/' + 'origin' + '/');
});

ipcMain.on('open_login_config', (event, arg) => {
  shell.showItemInFolder(app.getPath('userData') + '/config.json');
});

ipcMain.on('open_url_list', (event, arg) => {
  shell.showItemInFolder(app.getPath('userData') + '/url_list.json');
});

ipcMain.on('open_diff_directory', (event, arg) => {
  shell.showItemInFolder(app.getPath('userData') + '/' + 'diff' + '/');
});

ipcMain.on('open_test_result_directory', (event, arg) => {
  shell.showItemInFolder(app.getPath('userData') + '/' + 'test_result' + '/');
});

ipcMain.on('open_origin_directory', (event, arg) => {
  shell.showItemInFolder(app.getPath('userData') + '/' + 'origin' + '/');
});

function initialize_env() {
  var copy_targets = ['config.json', 'url_list.json'];
  copy_targets.forEach( (filename) => {
    console.log(filename)
    var copy_from = __dirname + '/' + filename;
    var copy_dist = app.getPath('userData') + '/' + filename;
    if(!fse.existsSync(copy_dist)) {
      fse.copySync(copy_from, copy_dist);
    }
  });
  var base_directories = ['diff', 'origin', 'test_result'];
  base_directories.forEach( (dirname) => {
    var directory_path = app.getPath('userData') + '/' + dirname
    if(!fse.existsSync(directory_path)) {
      fse.mkdirSync(directory_path);
    }
  });
}
