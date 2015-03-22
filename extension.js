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
      this.activated= false;
   },
});

const IpMenu = new Lang.Class({
   Name: 'IpMenu.IpMenu',
   Extends: PanelMenu.Button,

   _init: function() {

      this.nmStarted = true;
      this.selectedDevice = null;

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
         this.nmStarted = false;
         return;
      }

      this._clientAddedId = this.client.connect('device-added', Lang.bind(this,this._deviceAdded));
      this._clientRemovedId = this.client.connect('device-removed', Lang.bind(this,this._deviceRemoved));
      this._getNetworkDevices(this.client);
      this._updateMenuVisibility();
   },

   _updateMenuVisibility: function() {
      this.actor.show();
   },

   _deviceAdded: function(client,device) {
      let _device;
      _device = new IpDevice(device);
      _device._stateChangedId = device.connect('state-changed',Lang.bind(this,this._updateIp));
      this._devices.push(_device);
      this._updateIp(device);
   },

   _deviceRemoved: function(client,device) {
      for (let dev of this._devices) {
         if (dev.device == device) {
            this._resetDevice(dev);
            if (this.selectedDevice == dev.ifc) {
               this.selectedDevice = null;
               this.label.set_text(NOT_CONNECTED);
            }
            let index = this._devices.indexOf(dev);
            if (index > -1) {
               this._devices.splice(index, 1);
            }
            this._createPopupMenu();
            break;
         }
      }
   },

   _createPopupMenu: function() {
      this.menu.removeAll();
      for (let device of this._devices) {
         if (device.activated== true){
            this._addToPopupMenu(device.ifc);
         }
      }
   },

   _addToPopupMenu: function(dev) {
      this.item = new PopupMenu.PopupMenuItem(dev);
      this.menu.addMenuItem(this.item);
      this._manualUpdateId = this.item.connect('activate', Lang.bind(this,this._manualUpdate));
   },

   _manualUpdate: function(it) {
      for (let device of this._devices) {
         if (device.ifc == it.label.get_text()){
            this.selectedDevice = device.ifc;
            this.label.set_text(device.ip);
            break;
         }
      }
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
   },

   _updateIp: function(dev) {

      let ipconf = dev.get_ip4_config();
      let ifc = dev.get_iface();

      if (ipconf != null && dev.get_state() == NetworkManager.DeviceState.ACTIVATED) {
         this._addInterface(ipconf,ifc);
      }
      else{
         this._deleteInterface(ifc);
      }
   },

   _addInterface: function(ipconf, ifc) {
      for (let device of this._devices){
         if (device.ifc == ifc){

            if (device._ipConfId != null) {
               device.ipconf.disconnect(device._ipConfId);
               device._ipConfId = null;
            }

            device.activated= true;
            device.ipconf = ipconf;

            if (typeof(device.ipconf.get_addresses()[0]) == 'undefined') {
               device._ipConfId = ipconf.connect('notify::addresses',Lang.bind(this,function(){
                  ipconf.disconnect(device._ipConfId);
                  device._ipConfId = null;
                  if (typeof(device.ipconf.get_addresses()[0]) != 'undefined') {
                     this._getIp4s(ipconf.get_addresses()[0].get_address(),ifc);
                  }
                  // tweak to catch possible buffered notification
                  else {
                     this._getIp4s(0,ifc);
                  }
               }));
            }
            else {
               this._getIp4s(ipconf.get_addresses()[0].get_address(),ifc);
            }
            break;
         }
      }
   },

   _deleteInterface: function (ifc) {

      for (let device of this._devices) {
         if (device.ifc == ifc) {
            device.activated= false;

            if (this.selectedDevice == device.ifc) {
               this.selectedDevice = null;

               for (let dev of this._devices) {
                  if (dev.activated == true) {
                     this.selectedDevice = dev.ifc;   
                     this.label.set_text(dev.ip);
                     break;
                  }
                  else{
                     this.label.set_text(NOT_CONNECTED);
                  }
               }
            }
            break;
         }
      }

      this._createPopupMenu();
   },

   _getIp4s: function (ipadd,ifc) {

      for (let device of this._devices) {
         if(device.ifc == ifc) {
            device.ip = this._decodeIp4(ipadd);

            if (this.selectedDevice == null) {
               this.selectedDevice = device.ifc;
               this.label.set_text(device.ip);
            }
            break;
         }
      }
      this._createPopupMenu();
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

   _resetDevice: function(device) {
      GObject.Object.prototype.disconnect.call(device.device,device._stateChangedId);
      if (device._ipConfId != null) {
         GObject.Object.prototype.disconnect.call(device.ipconf,device._ipConfId);
      }
   },

   destroy: function() {
      this.parent();
      if (this.nmStarted == true) {
         for (let device of this._devices) {
            this._resetDevice(device);
         }
         this._devices=[];
         this.client.disconnect(this._clientAddedId);
         this.client.disconnect(this._clientRemovedId);
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
