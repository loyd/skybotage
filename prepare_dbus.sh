#!/bin/sh

gcc libs/dbus_mediator.c -o libs/.dbus_mediator \
    `pkg-config --cflags --libs glib-2.0` \
    `pkg-config --cflags --libs dbus-glib-1`