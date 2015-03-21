/* -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
 *
 * Show Ip menu gnome extension
 * https://github.com/sgaraud/
 *
 */

const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const NMC = imports.gi.NMClient;

const NOT_CONNECTED = 'not connected'

function init() {
   
}

const IpMenu = new Lang.Class({
   Name: 'IpMenu.IpMenu',
   Extends: PanelMenu.Button,

   _init: function() {

      //this._clientAddedId;
      //this._clientRemovedId;
      //this._manualUpdateId;
      //this._stateChangedId;

      this.parent(0.0, _("Show IP"));

      let nbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });

      this.label = new St.Label({ text: '',
         y_expand: true,
         y_align: Clutter.ActorAlign.CENTER });

      nbox.add_child(this.label);
      this.actor.add_child(nbox);

      this.label.set_text(NOT_CONNECTED);

      this.client = NMC.Client.new();
      this._clientAddedId = this.client.connect('device-added', Lang.bind(this,this._getNetworkDevices));
      this._clientRemovedId = this.client.connect('device-removed', Lang.bind(this,this._getNetworkDevices));
      this._getNetworkDevices(this.client);
      this._updateMenuVisibility();
   },

   _addToPopupMenu: function(dev) {
      this.item = new PopupMenu.PopupMenuItem(dev);
      this.menu.addMenuItem(this.item);
      this._manualUpdateId = this.item.connect('activate', Lang.bind(this,this._manualUpdate));
   },

   _createPopupMenu: function() {
      this.menu.removeAll();
      for (let key of this.mapIps.keys()) {
         this._addToPopupMenu(key);
      }
   },

   _manualUpdate: function(it) {
      this.deviceSelected = it.label.get_text();
      this.label.set_text(this.mapIps.get(this.deviceSelected));
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

   _getNetworkDevices: function(nmc) {
      this.devices = nmc.get_devices();
      this.mapIps = new Map();
      this.deviceSelected = null;
      this._devicesId=[];
      this._ipconfId=[];
      let i = 0;
      for (let device of this.devices) {
         this._updateIp(device);
         this._devicesId[i++] = device.connect('state-changed',Lang.bind(this,this._updateIp));
      }
   },

   _getIp4s: function (ipconf,ifc) {
      this.mapIps.set(ifc,this._decodeIp4(ipconf));
      if (this.deviceSelected == null){
         this.deviceSelected = ifc;
         this.label.set_text(this.mapIps.get(this.deviceSelected));
      }
      this._createPopupMenu();
   },

   _updateIp: function(dev) {

      let ipconf = dev.get_ip4_config();
      let ifc = dev.get_iface();

      if (ipconf != null) {
         log("ip4");
         log(ipconf);
         if (typeof(ipconf.get_addresses()[0]) == 'undefined') {
            this._ipconfId.push(ipconf.connect('notify::addresses',Lang.bind(this,function(){
               log('callback ip4 addresses');
               this._getIp4s(ipconf.get_addresses()[0].get_address(),ifc);
            })));
         }
         else {
            this._getIp4s(ipconf.get_addresses()[0].get_address(),ifc);
         }
      }
      else{
         log('delete interface');
         log(ifc);
         this.mapIps.delete(ifc);

         if(this.deviceSelected == ifc){
            if (this.mapIps.size == 0) {
               this.deviceSelected = null;
               this.label.set_text(NOT_CONNECTED);
            }
            else{
               for (let key of this.mapIps.keys()) {
                  this.deviceSelected = key;
                  this.label.set_text(this.mapIps.get(this.deviceSelected));
               }
            }
         }
         this._createPopupMenu();
      }
   log(this._ipconfId);
   },

   _resetDevices: function() {
      log("reset devices");
      let i = 0;
      this.mapIps.clear();
      this.deviceSelected = null;
      for (let device of this.devices) {
      GObject.Object.prototype.disconnect.call(device,this._devicesId[i++]);
      
      }
      this._devicesId=[];
   },

   destroy: function() {
      this._resetDevices();
      this.client.disconnect(this._clientAddedId);
      this.client.disconnect(this._clientRemovedId);
      this.item.disconnect(this._manualUpdateId);
      this.parent();
   },
});

let _indicator;

function enable() {
   _indicator = new IpMenu;
   Main.panel.addToStatusArea('Ip-menu', _indicator);
}

function disable() {
   _indicator.destroy();
}
