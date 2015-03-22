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
const NetworkManager = imports.gi.NetworkManager;

const NOT_CONNECTED = 'not connected'
const NM_NOT_RUNNING = 'NM not running'

function init() {

}

const IpDevice = new Lang.Class({
   Name: 'IpDevice.IpDevice',
   _init: function (obj) {
      this.device = obj;
      this.ifc = obj.get_iface();
      this.ipconf = obj.get_ip4_config();
      this.ip = NOT_CONNECTED;
      this._stateChangedId = null;
      this._ipConfId = null;
      this.selected = false;
      this.displayed = false;
   },
});


const IpMenu = new Lang.Class({
   Name: 'IpMenu.IpMenu',
   Extends: PanelMenu.Button,

   _init: function() {

      this._started = true;
      this.parent(0.0, _("Show IP"));

      let nbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });

      this.label = new St.Label({ text: '',
         y_expand: true,
         y_align: Clutter.ActorAlign.CENTER });

      nbox.add_child(this.label);
      this.actor.add_child(nbox);

      this.label.set_text(NOT_CONNECTED);
      this.client = NMC.Client.new();

      if (this.client.get_manager_running() == false) {
         this.label.set_text(NM_NOT_RUNNING);
         this._started = false;
         return;
      }

      //this._clientAddedId = this.client.connect('device-added', Lang.bind(this,this._getNetworkDevices));
      //this._clientRemovedId = this.client.connect('device-removed', Lang.bind(this,this._getNetworkDevices));
      this._getNetworkDevices(this.client);
      this._updateMenuVisibility();
   },

   _addToPopupMenu: function(dev) {
      this.item = new PopupMenu.PopupMenuItem(dev);
      this.menu.addMenuItem(this.item);
      this._manualUpdateId = this.item.connect('activate', Lang.bind(this,this._manualUpdate));
   },

   _createPopupMenu: function() {

      let i = 0;
      this.menu.removeAll();

      for (let device of this._devices) {
         if (device.displayed == true){
            this._addToPopupMenu(device.ifc);
            log("hehe " + device.ifc);
         }
         if (device.selected == true) {
         i++;
         }
      }
      log("haha " + i);
      if(i == 0 && this._devices.length !=0) {
       for (let device of this._devices) {
       }
      }
   },

   _manualUpdate: function(it) {
      for (let device of this._devices) {
         if (device.ifc == it.label.get_text()){
            this.label.set_text(device.ip);
            device.selected = true;
         }
         else {
         if (device.selected == true ) {
            device.selected = false;
         }
         }
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

   _getNetworkDevices: function(nmc) {
      let _device;
      this.devices = nmc.get_devices();
      this._devices = [];
      let i = 0;
      for (let device of this.devices) {
         _device = new IpDevice(device);
         _device._stateChangedId = device.connect('state-changed',Lang.bind(this,this._updateIp));
         this._devices[i++] = _device;
         this._updateIp(device);
      }
      log(this._devices);
   },

   _getIp4s: function (ipadd,ifc) {

      for (let device of this._devices) {
         if(device.ifc == ifc) {
            device.ip = this._decodeIp4(ipadd);
         }
      }
      this._createPopupMenu();
   },


   _addInterface: function(ipconf, ifc) {
      log(this._devices);
      for (let device of this._devices){
         if (device.ifc == ifc){
            log("BOOM");
            device.displayed = true;
            device.ipconf = ipconf;

            if (typeof(device.ipconf.get_addresses()[0]) == 'undefined') {
               device._ipConfId = ipconf.connect('notify::addresses',Lang.bind(this,function(){
                  log('callback ip4 addresses');
                  this._getIp4s(ipconf.get_addresses()[0].get_address(),ifc);
               }));
            }
            else {
               this._getIp4s(ipconf.get_addresses()[0].get_address(),ifc);
            }
         }
      }

   },

   _deleteInterface: function (ifc) {

      for (let device of this._devices){
         if (device.ifc == ifc){
            log("BAM");
            device.displayed = false;
            if (device.selected == true){
               device.selected = false;
            }
         }
      }

      this._createPopupMenu();
   },

   _updateIp: function(dev) {

      let ipconf = dev.get_ip4_config();
      let ifc = dev.get_iface();

      if (ipconf != null && dev.get_state() == NetworkManager.DeviceState.ACTIVATED) {
         log('add interface');
         this._addInterface(ipconf,ifc);
      }
      else{
         log('delete interface');
         this._deleteInterface(ifc);
      }
   },

   _resetDevices: function() {
      log("reset devices");
      for (let device of this._devices) {
         GObject.Object.prototype.disconnect.call(device.device,device._stateChangedId);
         if (device._ipConfId != null) {
            GObject.Object.prototype.disconnect.call(device.ipconf,device._ipConfId);
         }
      }
   },

   destroy: function() {
      this.parent();
      if (this._started == true) {
         this._resetDevices();
         this._devices=[];
         //this.client.disconnect(this._clientAddedId);
         //this.client.disconnect(this._clientRemovedId);
         this.item.disconnect(this._manualUpdateId);
      }
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
