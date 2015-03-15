/* -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
 *
 * Show Ip menu gnome extension
 * https://github.com/sgaraud/
 *
 */

const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const NetworkManager = imports.gi.NetworkManager;
const NMC = imports.gi.NMClient;

const NOT_CONNECTED = 'not connected'
var mapIps = new Map();
var deviceSelected = null;

const IpMenu = new Lang.Class({
   Name: 'IpMenu.IpMenu',
   Extends: PanelMenu.Button,

   _init: function() {
      this.parent(0.0, _("Show IP"));

      let nbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });

      this.label = new St.Label({ text: '',
         y_expand: true,
         y_align: Clutter.ActorAlign.CENTER });

      nbox.add_child(this.label);
      this.actor.add_child(nbox);

      this.label.set_text(NOT_CONNECTED);

      this.client = NMC.Client.new();
      this.client.connect('device-added', Lang.bind(this,this._getNetworkDevices));
      this.client.connect('device-removed', Lang.bind(this,this._getNetworkDevices));

      this._getNetworkDevices(this.client);

      

      this._updateMenuVisibility();
   },

   _addToPopupMenu: function(dev) {
         let item = new PopupMenu.PopupMenuItem(dev);
         this.menu.addMenuItem(item);
         item.connect('activate', Lang.bind(this,this._manualUpdate));
   },

   _manualUpdate: function(it) {
      deviceSelected = it.label.get_text();
      log(mapIps.get(deviceSelected));
      this.label.set_text(mapIps.get(deviceSelected));
   },

   _zetest: function(obj) {
      log(Object.getOwnPropertyNames(obj));
   },

   _getNetworkDevices: function(nmc) {
      this.devices = nmc.get_devices();
      for each (let device in this.devices) {
         log('update')
         this._uIp(device);
         log('bind state')
         device.connect('notify::ip4-config',Lang.bind(this,this._uIp));
         //device.connect('notify::dhcp4-config',Lang.bind(this,this._uIp));
      }
   },

   _updateMenuVisibility: function() {
      this.actor.show();
   },

   _uIp: function(dev) {
      log("aaaaaaaaaaa");
      log(dev.get_iface());
      log(dev.get_state());
      let ip = 'unknown';
      let ipcfg = dev.get_ip4_config();
      log(ipcfg);
      if (ipcfg != null) {
         log('ipconfig is not null!');
         // array of Ips ?
         log(ipcfg.get_addresses());
         for each(let addr in ipcfg.get_addresses()){
            let num = addr.get_address();
            num = num>>>0; 
            let array = Uint8Array(4);
            array[0] = num;
            array[1] = num >> 8;
            array[2] = num >> 16;
            array[3] = num >> 24;
            ip = array[0]+'.'+array[1]+'.'+array[2]+'.'+array[3];
            log(ip);
         }
         mapIps.set(dev.get_iface(),ip);

         if (dev.get_state() == NetworkManager.DeviceState.ACTIVATED && deviceSelected == null){
         log('device is connected');
         deviceSelected = dev.get_iface();
         this.label.set_text(mapIps.get(deviceSelected));
      }


      }
      else{
         log('ipconfig is null');
         if(deviceSelected == dev.get_iface()){
            deviceSelected = null;
            this.label.set_text(NOT_CONNECTED);
         }
         mapIps.delete(dev.get_iface());
      }
      
      log('add to pop')
      this.menu.removeAll();
      for (let key of mapIps.keys()) {
         log(key);
         this._addToPopupMenu(key);
      }
   },


   destroy: function() {
      mapIps.clear();
      deviceSelected = null;
      this.parent();
   },
});

function init() {
   //nothing to do
}

let _indicator;

function enable() {
   log('enable ipshow');
   //log(this.client.get_manager_running());
   _indicator = new IpMenu;
   Main.panel.addToStatusArea('Ip-menu', _indicator);
}

function disable() {
   log('disable ipshow');
   _indicator.destroy();
}
