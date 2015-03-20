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
         device.connect('state-changed',Lang.bind(this,this._updateIp));
      }
   },

   _updateMenuVisibility: function() {
      this.actor.show();
   },

   _getIps: function (dhcpconf,iface) {
      mapIps.set(iface,dhcpconf.get_one_option("ip_address"));
      if (deviceSelected == null){
         deviceSelected = iface;
         this.label.set_text(mapIps.get(deviceSelected));
      }
      this._createPopupMenu();
   },

   _updateIp: function(dev) {
      let iface = dev.get_iface();
      let dhcpconf = dev.get_dhcp4_config();
      if (dhcpconf != null) {
         if (dhcpconf.get_one_option("ip_address") == undefined ) {
            dhcpconf.connect('notify::options',Lang.bind(this,function(){
               this._getIps(dhcpconf,iface);
            }));
         }
         else {
            this._getIps(dhcpconf,iface);
         }
      }
      else{
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
                  return
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
