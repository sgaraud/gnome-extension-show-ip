// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
// Show Ip menu extension
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

//NM_ACTIVE_CONNECTION_STATE_UNKNOWN = 0
//NM_ACTIVE_CONNECTION_STATE_ACTIVATING = 1
//NM_ACTIVE_CONNECTION_STATE_ACTIVATED = 2
//NM_ACTIVE_CONNECTION_STATE_DEACTIVATING = 3
//NM_ACTIVE_CONNECTION_STATE_DEACTIVATED = 4
//
//
//at startup
//get the list of network devices
//display the list as a popup menu
//
//display the ip of default active one + icon
//
//manage special case if list is empty
//
//if popup is opened, refresh the device list
//when one is selected display the ip or not conencted if no ip
//

var myMap = new Map();
var listDevices = [];

const IpMenu = new Lang.Class({
   Name: 'IpMenu.IpMenu',
      Extends: PanelMenu.Button,

      _init: function() {
         this.parent(0.0, _("Show IP"));

         //create panel widget
         let nbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
         let icon = new St.Icon({ icon_name: 'network-wired-symbolic',
            style_class: 'system-status-icon' });

         this.label = new St.Label({ text: '',
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER });


         nbox.add_child(icon);
         nbox.add_child(this.label);
         this.actor.add_child(nbox);

         this._getNetworkDevices();
         this._updateDeviceStatus();
         this._updateMainLabel(myMap.get(this._findActiveConnection()));
         this._createPopupMenu();
         this._updateMenuVisibility();
      },

      _createPopupMenu: function() {

         for each (let dev in listDevices) {
            let item = new PopupMenu.PopupMenuItem(dev.get_iface());
            this.menu.addMenuItem(item);
            item.connect('activate', Lang.bind(this,this._manualUpdate));
          }
      },

      _manualUpdate: function(it) {
         //log(Object.getOwnPropertyNames(it));
         log(it.label.get_text());
         this._getNetworkDevices();
         this._updateDeviceStatus();
         this._updateMainLabel(myMap.get(it.label.get_text()));
      },

      _zetest: function(obj) {
         log(Object.getOwnPropertyNames(obj));
      },

      _decodeIp: function(device) {
         let ip;
         if (device.get_state() == 100){
            let ipcfg = device.get_ip4_config();
            // array of Ips ?
            for each(let addr in ipcfg.get_addresses()){
               let num = addr.get_address();
               num = num>>>0; 
               let array = Uint8Array(4);
               array[0] = num;
               array[1] = num >> 8;
               array[2] = num >> 16;
               array[3] = num >> 24;
               ip = array[0]+'.'+array[1]+'.'+array[2]+'.'+array[3];
            }
         }
         else {
            ip = 'not connected';
         }
         return ip;
      },

      _getNetworkDevices: function() {
         //create the list of network device. TODO: test with no network devices
         listDevices = [];
         this.client = NMC.Client.new();
         this.devices = this.client.get_devices();
         for each (let device in this.devices) {
            listDevices.push(device);
         }
         log(listDevices);
      },

      _findActiveConnection: function () {
         let defaultDevice = null;
         //find the active connection if any
         this.client = NMC.Client.new();
         this.activeConnections = this.client.get_active_connections();
         for each (let activeConnection in this.activeConnections) {
            defaultDevice = activeConnection.get_devices()[0].get_iface();
            log(defaultDevice);
            return defaultDevice; // stop after the first one found, if several
         }
         return defaultDevice;
      },

      _updateMainLabel: function (ip) {     
         this.label.set_text(ip);
      },

      _updateMenuVisibility: function() {
         this.actor.show();
      },

      _updateDeviceStatus: function() {
         myMap = new Map();
         myMap.set(null,'not connected')
         for each (let dev in listDevices){
            myMap.set(dev.get_iface(),this._decodeIp(dev));
         }
      },

      destroy: function() {
         this.parent();
         myMap = new Map();
         listDevices = [];
      },
});

function init() {
   //nothing to do
}

let _indicator;

function enable() {
   log('enable ipshow');
   _indicator = new IpMenu;
   Main.panel.addToStatusArea('Ip-menu', _indicator);
}

function disable() {
   log('enable ipshow');
   _indicator.destroy();
}
