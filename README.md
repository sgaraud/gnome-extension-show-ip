# Show IP in the GNOME Shell

This GNOME extension (v2) is simply showing current private IP in
gnome shell status bar if Network Manager is used.  It has a popup
menu to select manually the network device to display if several are
activated on the machine.

### Screenshot

![show ip extension on gnome shell](show_ip_screenshot.png?raw=true
 "Show IP gnome extension")

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

Bugs should be reported to the Github [bug tracker
issues](https://github.com/sgaraud/gnome-extension-show-ip/issues).

### TODO for next version (version 3)
  * improvements to the interface
  * copy to clipboard the address
  * add a preference menu to configure public ip mechanism,
    preferred network and maybe ipv6
  
### License

Copyright (C) 2015 Sylvain Garaud

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
