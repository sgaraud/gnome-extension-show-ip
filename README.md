# Show IP in the GNOME Shell

This GNOME extension (v2) is simply showing current private IP in
gnome shell status bar if Network Manager is used.  It has a popup
menu to select manually the network device to display if several are
activated on the machine. It supports both IPv4 and IPv6. Possibility to 
display public IP. Button for copying IP address into clipboard.

### Screenshots


![show ip extension on gnome shell, ipv4](show_ipv4_screenshot.png?raw=true
 "Show IPv4 gnome extension")
> Standard IPv4 address. Button for copying address to clipboard.

![show ip extension on gnome shell, ipv6 compatible](show_ipv6_screenshot.png?raw=true
 "Show IPv6 gnome extension")
> Support for IPv6 syntax

![show ip extension preference menu](show_ip_pref_menu_screenshot.png?raw=true
 "Show IP pref menu gnome extension")
 > Preferences menu for activating Public IP display (not displayed by default)

### Installation

#### From gnome extensions website

The extension is available from the
extensions.gnome.org website. Visit the following link for
instructions.

https://extensions.gnome.org/extension/941/show-ip/

#### From source

The extension can be installed directly from source,
either for the convenience of using git or to test the latest version.

Clone the desire branch with git

    git clone https://github.com/sgaraud/gnome-extension-show-ip.git \
    ~/.local/share/gnome-shell/extensions/show-ip@sgaraud.github.com


A Shell reload is required <code>Alt+F2 r Enter</code> and extension
has to be enabled with *gnome-tweak-tool*

### Bug Reporting

:sweat_smile: Bugs should be reported to the Github [bug tracker
issues](https://github.com/sgaraud/gnome-extension-show-ip/issues).

### Authors

  * sgaraud (Sylvain Garaud)
  * rigelk (Pierre-Antoine Rault)

### License

Copyright (C) 2015 Sylvain Garaud

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
