#!/usr/bin/env bash
# Build Show-IP GNOME shell extension

echo "Compile schema"
glib-compile-schemas ./schemas/

echo "Compile French locale (po to mo)"
msgfmt locale/fr/LC_MESSAGES/show-ip.po -o locale/fr/LC_MESSAGES/show-ip.mo

echo "Create zip archive"
rm show-ip@sgaraud.github.com.zip
zip -r show-ip@sgaraud.github.com.zip . -x \*.git* \*.idea*
echo "Done."
