#!/usr/bin/env bash

#Extract strings to translate .pot
xgettext -k_ -kN_ -o locale/show-ip.pot *.js

#Create a new French translation po
msginit -i locale/show-ip.pot -o locale/fr/show-ip.po
