#!/usr/bin/env bash
# Build show-ip gnome shell extension

echo "Compile schema"
glib-compile-schemas ./schemas/

echo "Create zip archive"
rm show-ip@sgaraud.github.com.zip
zip -r show-ip@sgaraud.github.com.zip . -x \*.git* \*.idea*
echo "Done."
