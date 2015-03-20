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

   _createPopupMenu: function() {
      this.menu.removeAll();
      for (let key of mapIps.keys()) {
         this._addToPopupMenu(key);
      }
   },

   _manualUpdate: function(it) {
      deviceSelected = it.label.get_text();
      this.label.set_text(mapIps.get(deviceSelected));
   },

   _getNetworkDevices: function(nmc) {
      this.devices = nmc.get_devices();
      for each (let device in this.devices) {

         this._updateIp(device);
         //log(NetworkManager.DeviceState.UNMANAGED);
         //log(device.get_iface());
         //log(device.get_state());
         device.connect('state-changed',Lang.bind(this,this._updateIp));
      }
   },

   _updateMenuVisibility: function() {
      this.actor.show();
   },

   _decodeIp4: function(num) {
      num = num>>>0;
      let array = Uint8Array(4);
      array[0] = num;
      array[1] = num >> 8;
      array[2] = num >> 16;
      array[3] = num >> 24;

      return array[0]+'.'+array[1]+'.'+array[2]+'.'+array[3];
   },

   _decodeIp6: function(num) {
      return num;
   },


   _getIp4s: function (ip4conf,iface) {
      mapIps.set(iface,this._decodeIp4(ip4conf));
      if (deviceSelected == null){
         deviceSelected = iface;
         this.label.set_text(mapIps.get(deviceSelected));
      }
      this._createPopupMenu();
   },

   _getIp6s: function (ip6conf,iface) {
      mapIps.set(iface,this._decodeIp6(ip6conf));
      if (deviceSelected == null){
         deviceSelected = iface;
         this.label.set_text(mapIps.get(deviceSelected));
      }
      this._createPopupMenu();
   },

   _updateIp: function(dev) {
      let iface = dev.get_iface();
      let ip4conf = dev.get_ip4_config();
      let ip6conf = dev.get_ip6_config();

      if (ip4conf != null) {
         log("ip4");
         log(ip4conf.get_addresses()[0]);

         if (ip4conf.get_addresses()[0].get_address() == undefined ) {
            ip4conf.connect('notify::addresses',Lang.bind(this,function(){
               log('callback ip4 addresses');
               this._getIp4s(ip4conf.get_addresses()[0].get_address(),iface);
            }));
         }
         else {
            this._getIp4s(ip4conf.get_addresses()[0].get_address(),iface);
         }
      }
      else if (ip6conf != null) {
         log("ip6");
         log(ip6conf.get_addresses()[0]);

         if (ip6conf.get_addresses()[0].get_address() == undefined ) {
            ip6conf.connect('notify::addresses',Lang.bind(this,function(){
               log('callback ip6 addresses');
               this._getIp6s(ip6conf.get_addresses()[0].get_address(),iface);
            }));
         }
         else {
            this._getIp6s(ip6conf.get_addresses()[0].get_address(),iface);
         }


      }
      else{
         log('delete interface');
         log(iface);
         mapIps.delete(iface);

         if(deviceSelected == iface){
            if (mapIps.size == 0) {
               deviceSelected = null;
               this.label.set_text(NOT_CONNECTED);
            }
            else{
               for (let key of mapIps.keys()) {
                  deviceSelected = key;
                  this.label.set_text(mapIps.get(deviceSelected));
               }
            }
         }
         this._createPopupMenu();
      }
   },


   destroy: function() {
      log("destroy");
      mapIps.clear();
      deviceSelected = null;
      this.client.disconnect('device-added');
      this.client.disconnect('device-removed');
      this.parent();
   },
});

function init() {
   //nothing to do
}

let _indicator;

function enable() {
   _indicator = new IpMenu;
   Main.panel.addToStatusArea('Ip-menu', _indicator);
}

function disable() {
   _indicator.destroy();
}
