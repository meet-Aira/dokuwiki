/**
 * Some of these scripts were taken from TinyMCE (http://tinymce.moxiecode.com/) and were modified for DokuWiki
 * 
 * Class handles accesskeys using javascript and also provides ability
 * to register and use other hotkeys as well.
 *
 * @author Marek Sacha <sachamar@fel.cvut.cz>
 */
function Hotkeys() {

    this.shortcuts = new Array();

    /**
     * Set modifier keys, for instance:
     *  this.modifier = 'ctrl';
     *  this.modifier = 'ctrl+shift';
     *  this.modifier = 'ctrl+alt+shift';
     *  this.modifier = 'alt';
     *  this.modifier = 'alt+shift';
     */
    this.modifier = 'ctrl';

    /**
     * Initialization
     *
     * This function looks up all the accesskeys used in the current page
     * (at anchor elements and input elements [type="submit"]) and registers
     * appropriate shortcuts.
     *
     * @author Marek Sacha <sachamar@fel.cvut.cz>
     */
    this.initialize = function() {
        var t = this;
        /**
         * Lookup all anchors with accesskey and register event - go to anchor
         * target.
         */
        var anchors = document.getElementsByTagName("a");
        t.each(anchors, function(a) {
            if (a.accessKey != "") {
                t.addShortcut(t.modifier + '+' + a.accessKey, function() {
                    window.location.href = a.href;
                });
            }
        });

        /**
         * Lookup all input [type="submit"] with accesskey and register event -
         * perform "click" on a button.
         */
        var inputs = document.getElementsByTagName("input");
        t.each(inputs, function(i) {
            if (i.type == "submit") {
                t.addShortcut(t.modifier + '+' + i.accessKey, function() {
                    i.click();
                });
            }
        });
    };

    /**
     * Keyup processing function
     * Function returns true if keyboard event has registered handler, and
     * executes the handler function.
     *
     * @param e KeyboardEvent
     * @author Marek Sacha <sachamar@fel.cvut.cz>
     * @return b boolean 
     */
    this.onkeyup = function(e) {
        var t = this;
        var v = t.findShortcut(e);
        if (v != null && v != false) {
            v.func.call(t);
            return false;
        }
        return true;
    };

    /**
     * Keydown processing function
     * Function returns true if keyboard event has registered handler
     *
     * @param e KeyboardEvent
     * @author Marek Sacha <sachamar@fel.cvut.cz>
     * @return b boolean
     */
    this.onkeydown = function(e) {
        var t = this;
        var v = t.findShortcut(e);
        if (v != null && v != false) {
            return false;
        }
        return true;
    };

    /**
     * Keypress processing function
     * Function returns true if keyboard event has registered handler
     *
     * @param e KeyboardEvent
     * @author Marek Sacha <sachamar@fel.cvut.cz>
     * @return b
     */
    this.onkeypress = function(e) {
        var t = this;
        var v = t.findShortcut(e);
        if (v != null && v != false) {
            return false;
        }
        return true;
    };

    /**
     * Register new shortcut
     *
     * This function registers new shortcuts, each shortcut is defined by its
     * modifier keys and a key (with + as delimiter). If shortcut is pressed
     * cmd_function is performed.
     *
     * For example:
     *  pa = "ctrl+alt+p";
     *  pa = "shift+alt+s";
     *
     * Full example of method usage:
     *  hotkeys.addShortcut('ctrl+s',function() {
     *      document.getElementByID('form_1').submit();
     *  });
     *
     * @param pa String description of the shortcut (ctrl+a, ctrl+shift+p, .. )
     * @param cmd_func Function to be called if shortcut is pressed
     * @author Marek Sacha <sachamar@fel.cvut.cz>
     */
    this.addShortcut = function(pa, cmd_func) {
        var t = this;

        var o = {
            func : cmd_func,
            alt : false,
            ctrl : false,
            shift : false
        };

        t.each(t.explode(pa, '+'), function(v) {
            switch (v) {
                case 'alt':
                case 'ctrl':
                case 'shift':
                    o[v] = true;
                    break;

                default:
                    o.charCode = v.charCodeAt(0);
                    o.keyCode = v.toUpperCase().charCodeAt(0);
            }
        });

        t.shortcuts.push((o.ctrl ? 'ctrl' : '') + ',' + (o.alt ? 'alt' : '') + ',' + (o.shift ? 'shift' : '') + ',' + o.keyCode,  o);

        return true;
    };

    /**
     * @property isMac
     */
    this.isMac = (navigator.userAgent.indexOf('Mac') != -1);

    /**
     * Apply function cb on each element of o in the namespace of s
     * @param o Array of objects
     * @param cb Function to be called on each object
     * @param s Namespace to be used during call of cb (default namespace is o)
     * @author Marek Sacha <sachamar@fel.cvut.cz>
     */
    this.each = function(o, cb, s) {
        var n, l;

        if (!o)
            return 0;

        s = s || o;

        if (o.length !== undefined) {
            // Indexed arrays, needed for Safari
            for (n=0, l = o.length; n < l; n++) {
                if (cb.call(s, o[n], n, o) === false)
                    return 0;
            }
        } else {
            // Hashtables
            for (n in o) {
                if (o.hasOwnProperty(n)) {
                    if (cb.call(s, o[n], n, o) === false)
                        return 0;
                }
            }
        }

        return 1;
    };

    /**
     * Explode string according to delimiter
     * @param s String
     * @param d Delimiter (default ',')
     * @author Marek Sacha <sachamar@fel.cvut.cz>
     * @return a Array of tokens
     */
    this.explode = function(s, d) {
        return  s.split(d || ',');
    };

    /**
     * Find if the shortcut was registered
     *
     * @param e KeyboardEvent
     * @author Marek Sacha <sachamar@fel.cvut.cz>
     * @return v Shortcut structure or null if not found
     */
    this.findShortcut = function (e) {
        var t = this;
        var v = null;

        /* No modifier key used - shortcut does not exist */
        if (!e.altKey && !e.ctrlKey && !e.metaKey) {
            return v;
        }

        t.each(t.shortcuts, function(o) {
            if (t.isMac && o.ctrl != e.metaKey)
                return;
            else if (!t.isMac && o.ctrl != e.ctrlKey)
                return;

            if (o.alt != e.altKey)
                return;

            if (o.shift != e.shiftKey)
                return;

            if (e.keyCode == o.keyCode || (e.charCode && e.charCode == o.charCode)) {
                v = o;
                return;
            }
        });
        return v;
    };
}

addInitEvent(function(){
    var hotkeys = new Hotkeys();
    hotkeys.initialize();

    addEvent(document,'keyup',function (e) {
        return hotkeys.onkeyup.call(hotkeys,e);
    });

    addEvent(document,'keypress',function (e) {
        return hotkeys.onkeypress.call(hotkeys,e);
    });

    addEvent(document,'keydown',function (e) {
        return hotkeys.onkeydown.call(hotkeys,e);
    });
});