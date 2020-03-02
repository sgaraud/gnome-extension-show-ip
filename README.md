# Show IP in the GNOME Shell

This GNOME extension (v2) is simply showing current private IP in
GNOME shell status bar if Network Manager is used.  It has a popup
menu to select manually the network device to display if several are
activated on the machine. It supports both IPv4 and IPv6. Possibility to 
display public IP. Button for copying IP address into clipboard. Available in English and French.

### Screenshots

> Standard IPv4 address. Button for copying address to clipboard.

![Show IP extension on GNOME shell, IPv4](show_ipv4_screenshot.png?raw=true
 "Show IPv4 GNOME extension")

> Support for IPv6 syntax

![Show IP extension on GNOME shell, IPv6 compatible](show_ipv6_screenshot.png?raw=true
 "Show IPv6 GNOME extension")

> Preferences menu for activating Public IP display (not displayed by default)

![Show IP extension preference menu](show_ip_pref_menu_screenshot.png?raw=true
 "Show IP pref menu GNOME extension")

> IP display in GNOME dropdown menu instead of GNOME shell status bar (not selected by default)

![Show IP extension in dropdown menu](show_ip_dropdown_menu_screenshot.png?raw=true
 "Show IP dropdown menu GNOME extension")


### Installation

#### From GNOME extensions website

The extension is available from the
extensions.gnome.org website. Visit the following link for
instructions.

https://extensions.gnome.org/extension/941/show-ip/

#### From source

The extension can be installed directly from source,
either for the convenience of using git or to test the latest version.

Dependencies:
 * git
 * glib2 (for glib-compile-schemas)
 * gettext (for msgfmt)

Clone the desire branch with git and compile schema and locales 

    git clone https://github.com/sgaraud/gnome-extension-show-ip.git \
    ~/.local/share/gnome-shell/extensions/show-ip@sgaraud.github.com
    
    cd ~/.local/share/gnome-shell/extensions/show-ip@sgaraud.github.com
    
    glib-compile-schemas ./schemas/
    
    msgfmt locale/fr/LC_MESSAGES/show-ip.po -o locale/fr/LC_MESSAGES/show-ip.mo

A shell reload is required <code>Alt+F2 r Enter</code> and extension
has to be enabled with *gnome-tweak-tool*

### Bug Reporting

:sweat_smile: Bugs should be reported to the Github [bug tracker
issues](https://github.com/sgaraud/gnome-extension-show-ip/issues).

### Author

  * sgaraud (Sylvain Garaud)
  
### Contributors

  * rigelk (Pierre-Antoine Rault)
  * RaphaelRochet (Raphaël Rochet) 
  * paddatrapper (Kyle Robbertze)
  * pabs3 (Paul Wise)
  * lkundrak (Lubomir Rintel)

### License

Copyright (C) 2015 Sylvain Garaud
Copyright 2017 Paul Wise

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
