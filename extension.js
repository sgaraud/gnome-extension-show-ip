// Ip menu extension
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

var listDevices = [];
var listIps = [];
var defaultDevice = 0;

const IpMenu = new Lang.Class({
   Name: 'IpMenu.IpMenu',
   Extends: PanelMenu.Button,

   _init: function() {
      this.parent(0.0, _("Network devices"));

      let nbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
      let icon = new St.Icon({ icon_name: 'network-wired-symbolic',
         style_class: 'system-status-icon' });

      this.label = new St.Label({ text: 'xxx.xxx.xxx.xxx',
         y_expand: true,
         y_align: Clutter.ActorAlign.CENTER });


      nbox.add_child(icon);
      nbox.add_child(this.label);
      this.actor.add_child(nbox);

      this._startup();
      for each (let deviface in listDevices) {
         let item = new PopupMenu.PopupMenuItem(deviface);
         item.connect('activate', Lang.bind(this,this._displayIps));
         this.menu.addMenuItem(item);
      }
      this._updateMenuVisibility();
   },

   _displayIps: function(iface) {
      this._displayIp(iface);
   },

   _displayIp: function(iface) {
      log(iface);
   },

      //this.label.set_text(listIps[defaultDevice]);


   _decodeIp: function(device) {
      let ip;

      if (device.get_state() == 100){
         log('decode');
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
         ip = 'not connected'
      }

      return ip;
   },


   _startup: function() {
      this.client = NMC.Client.new();
      this.devices = this.client.get_devices();
      for each (let device in this.devices) {
         log('loop');
         log(device.get_state());
         listDevices.push(device.get_iface());
         listIps.push('not connected');
         device.connect('state-changed',Lang.bind(this, this._update ));
         this._updateDeviceStatus(device);

         log('finish loop device');
      }
      log(listDevices);
      this.activeConnections = this.client.get_active_connections();
      for each (let activeConnection in this.activeConnections) {
         defaultDevice = this._findDevice(activeConnection.get_devices()[0].get_iface());
         log(defaultDevice);
         break; // the first one found become the default
      }

   },

   _findDevice: function(deviceIface) {
      return listDevices.indexOf(deviceIface);
   },

   _update: function(device) {
      this._updateDeviceStatus(device);
   },

   _updateDeviceStatus: function(dev) {
      log('update');
      //Mainloop.timeout_add_seconds(1,function(){log("THIS IS");});
      listIps[this._findDevice(dev.get_iface())] = this._decodeIp(dev);
      log(listIps);
      this.label.set_text(listIps[defaultDevice]);
   },


   _updateMenuVisibility: function() {
      this.actor.show();
   },

   destroy: function() {
      this.parent();
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
