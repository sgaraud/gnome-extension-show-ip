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

var listDevices = [];
var listIps = [];
var defaultDevice = 0;

const IpMenu = new Lang.Class({
   Name: 'IpMenu.IpMenu',
      Extends: PanelMenu.Button,

      _init: function() {
         this.parent(0.0, _("Show IP"));

         //create panel widget
         let nbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
         let icon = new St.Icon({ icon_name: this._get_icon('ethernet'),
            style_class: 'system-status-icon' });

         this.label = new St.Label({ text: '',
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER });


         nbox.add_child(icon);
         nbox.add_child(this.label);
         this.actor.add_child(nbox);

         //init global network devices and ip matching lists. put callbacks in place when network manager state change.
         this._startup();
         //create menu to manually change/refresh the displayed ip.
         this._createPopupMenu();
         //display widget
         this._updateMenuVisibility();
      },



      _createPopupMenu: function() {

         for each (let deviface in listDevices) {
            let item = new PopupMenu.PopupMenuItem(deviface);
            this.menu.addMenuItem(item);
            item.connect('activate', Lang.bind(this,this._manualUpdate));
          }
      },

      _manualUpdate: function(it) {
         //log(Object.getOwnPropertyNames(it));
         log(it.label.get_text());
         this.label.set_text(listIps[this._findDevice(it.label.get_text())]);
      },


      //   this._monitor.connect('changed', Lang.bind(this, function () {
      //     if (this._bookmarkTimeoutId > 0)
      //         return;
      /* Defensive event compression */
      //     this._bookmarkTimeoutId = Mainloop.timeout_add(100, Lang.bind(this, function () {
      //         this._bookmarkTimeoutId = 0;
      //          this._reloadBookmarks();
      //          return false;
      //      }));
      //   }));

      //log(this.label.set_text("yhoo"));

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
         listDevices = [];
         this.client = NMC.Client.new();
         this.devices = this.client.get_devices();
         //create the list of network device. TODO: test with no network devices
         for each (let device in this.devices) {
            log(device.get_state());
            listDevices.push(device.get_iface());
            listIps.push('not connected');
            device.connect('state-changed',Lang.bind(this, this._update ));
            //update the ip for each device
            this._updateDeviceStatus(device);
         }
         log(listDevices);
         //find the active connection if any
         this.activeConnections = this.client.get_active_connections();

         for each (let activeConnection in this.activeConnections) {
            defaultDevice = this._findDevice(activeConnection.get_devices()[0].get_iface());
            log(defaultDevice);
            break; // stop after the first one found, if several
         }
         //update the widget label with the active connection. otherwise first network device.      
         this.label.set_text(listIps[defaultDevice]);
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
      },


      _updateMenuVisibility: function() {
         this.actor.show();
      },

    _get_icon: function(name) {
	let iconname = "";
	switch (name) {
	case "ethernet":
	    iconname = "network-wired-symbolic";
	    break;
	case "wifi":
	    iconname = "network-wireless-signal-excellent-symbolic";
	    break;
	case "bt" :
	    iconname = "bluetooth-active-symbolic";
	    break;
	default:
	    iconname = "network-transmit-receive";
	}
   return iconname;

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
