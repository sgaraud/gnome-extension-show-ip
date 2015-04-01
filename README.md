# Show IP in the GNOME Shell

This GNOME extension (v1) is simply showing current private IP in gnome shell status bar if Network Manager is used.
It has a popup menu to select manually the network device to display if several are activated on the machine.

### Screenshot

![show ip extension on gnome shell](show_ip_screenshot.png?raw=true "Show IP gnome extension")

### Installation

#### From gnome extensions website
The extension is available from the extensions.gnome.org website. Visit the following link for instructions.

https://extensions.gnome.org/extension/941/show-ip/

#### From source
The extension can be installed directly from source, either for the convenience of using git or to test the latest version.

Clone the desire branch with git

    git clone https://github.com/sgaraud/gnome-extension-show-ip.git \
    ~/.local/share/gnome-shell/extensions/show-ip@sgaraud.github.com


A Shell reload is required <code>Alt+F2 r Enter</code> and extension has to be enabled  with *gnome-tweak-tool* 

### Bug Reporting

Bugs should be reported to the Github [bug tracker issues](https://github.com/sgaraud/gnome-extension-show-ip/issues).

### TODO for next version (version 2)
  * display the public IPs not only private IPs
  * remember the preferred network interface to display by default

### Author

  * Sylvain Garaud (garaud@gmail.com)
   
    https://github.com/sgaraud

### License
Show IP Gnome Shell extension is distributed under the terms of the GNU General Public License,
version 2 or later.
