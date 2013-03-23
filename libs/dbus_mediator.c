/**
 * It's fork of {@link http://konrad.familie-kieling.de/code/skype_dbus_client.c}
 */

#define REPLY_TIMEOUT -1

#include <stdio.h>
#include <glib.h>
#include <stdlib.h>
#include <string.h>
#include <locale.h>
 
#define DBUS_API_SUBJECT_TO_CHANGE
#include <dbus/dbus.h>
 
DBusConnection *connection;
 
/* Iterate through DBus messages and print the string components */
static void print_messages(DBusMessageIter *iter) {
    const int *str;
    do {
        int type = dbus_message_iter_get_arg_type(iter);
        if(type == DBUS_TYPE_STRING) {
            dbus_message_iter_get_basic(iter, &str);
            g_print("%s\n", str);
        } else if(type == DBUS_TYPE_VARIANT) {
            DBusMessageIter subiter;
            
            dbus_message_iter_recurse(iter, &subiter);
            print_messages(&subiter);
        } else if(type == DBUS_TYPE_INVALID)
            break;
    } while(dbus_message_iter_next(iter));
}
 
/* The handler gets called if the DBus connection receives any data */
static DBusHandlerResult
notify_handler(DBusConnection *bus, DBusMessage *msg, void *user_data) {
    DBusMessageIter iter;
    dbus_message_iter_init(msg, &iter);
    print_messages(&iter);
    
    return TRUE;
}

/* Send a string to skype */
void send_to_skype(char *msg) {
    DBusMessageIter iter;
    DBusError error;
    
    dbus_error_init(&error);
    DBusMessage *message = dbus_message_new_method_call(
        "com.Skype.API", "/com/Skype", "com.Skype.API", "Invoke"
    );

    if(!dbus_message_append_args(
        message, DBUS_TYPE_STRING, &msg, DBUS_TYPE_INVALID)) {
        fprintf(stderr, "Reply is not except format\n");
        exit(1);
    }
    
    DBusMessage *reply = dbus_connection_send_with_reply_and_block(
        connection, message, -1, &error);
    
    if(dbus_error_is_set(&error)) {
        fprintf(stderr, "%s\n", error.message);
        dbus_error_free(&error);
        exit(1);
    }
    
    dbus_message_iter_init(reply, &iter);
    print_messages(&iter);
     
    if(dbus_error_is_set(&error)) {
        fprintf(stderr, "%s\n", error.message);
        dbus_error_free(&error);
        exit(1);
    }
}
 
/* If the input is disconnected: exit the program */
gboolean
hangup_handler(GIOChannel *source, GIOCondition condition, gpointer data) {
    exit(0);
}
 
/* Input waiting: read and forward to skype */
gboolean
input_handler(GIOChannel *source, GIOCondition condition, gpointer data) {
    char *b;
    
    g_io_channel_read_line(source, &b, NULL, NULL, NULL);
    if(b == NULL) exit(0);
    
    send_to_skype(b);
    g_free(b);
    
    return TRUE;
}
 
int main(int argc, char **argv) {
    setlocale(LC_ALL, "en_US.utf8");

    DBusObjectPathVTable vtable;
    DBusError error;
    
    dbus_error_init(&error);
    connection = dbus_bus_get(DBUS_BUS_SESSION, &error);
    if(connection == NULL) {
        fprintf(stderr, "Failed to open connection to bus: %s\n", error.message);
        dbus_error_free(&error);
        exit(1);
    }
    
    GMainLoop *loop = g_main_loop_new(NULL, FALSE);
    
    GIOChannel *in = g_io_channel_unix_new(fileno(stdin));
    g_io_add_watch(in, G_IO_IN,  input_handler, NULL);
    g_io_add_watch(in, G_IO_HUP, hangup_handler, NULL);
    
    dbus_connection_setup_with_g_main(connection, NULL);
    
    vtable.message_function = notify_handler;
    dbus_connection_register_object_path(
        connection, "/com/Skype/Client", &vtable, 0);
    
    g_main_loop_run(loop);
    return 0;
}