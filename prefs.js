/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const SETTINGS_APP_ICON_MODE = 'app-icon-mode';
const SETTINGS_IPV6 = 'ipv6';
const SETTINGS_PUBLIC = 'public';
const SETTINGS_LOOKUP_SERVICE = 'ip-lookup-service';

const ShowIPSettingsWidget = new GObject.Class({
    Name: 'ShowIP.Prefs.ShowIPSettingsWidget',
    GTypeName: 'ShowIPSettingsWidget',
    Extends: Gtk.Grid,

    _init: function (params) {
        this.parent(params);
        this.margin = 24;
        this.row_spacing = 6;
        this.orientation = Gtk.Orientation.VERTICAL;

        this._settings = Convenience.getSettings();

        let presentLabel = '<b>' + _("Display options") + '</b>';
        this.add(new Gtk.Label({
            label: presentLabel, use_markup: true,
            halign: Gtk.Align.START
        }));

        let align = new Gtk.Alignment({left_padding: 12});
        this.add(align);

        let grid = new Gtk.Grid({
            orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 6,
            column_spacing: 6
        });
        align.add(grid);

        let check = new Gtk.CheckButton({
            label: _("Display IPv6 format"),
            margin_top: 6
        });
        this._settings.bind(SETTINGS_IPV6, check, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add(check);

        let check2 = new Gtk.CheckButton({
            label: _("Display public address"),
            margin_top: 6
        });
        this._settings.bind(SETTINGS_PUBLIC, check2, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.add(check2);

        this.add(new Gtk.Label({label: _("Public IP lookup service provider"), halign: Gtk.Align.START}));
        let txt = new Gtk.Entry();
        this._settings.bind(SETTINGS_LOOKUP_SERVICE, txt, 'text', Gio.SettingsBindFlags.DEFAULT);
        this.add(txt);

    },
});

function init() {
    Convenience.initTranslations();
}

function buildPrefsWidget() {
    let widget = new ShowIPSettingsWidget();
    widget.show_all();

    return widget;
}
