/*
 * Show IP menu GNOME extension
 * https://github.com/sgaraud/gnome-extension-show-ip
 *
 * Copyright (C) 2015 Sylvain Garaud
 *
 * This file is part of Show-IP GNOME extension.
 * Show IP GNOME extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Show IP GNOME extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Show IP GNOME extension.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
