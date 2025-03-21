(function(window, undefined) {

var Mondo;

Mondo = function() {};
    
function registerHandlebarHelpers() {
    Mondo.handlebars.registerHelper('d', function(d) { return Mondo.date(d); });
    Mondo.handlebars.registerHelper('t', function(d) { return Mondo.time(d); });
    Mondo.handlebars.registerHelper('f', function(value, format) { return Mondo.format(value, format); });
    Mondo.handlebars.registerHelper('p', function(d) { return Mondo.percent(d); });
    Mondo.handlebars.registerHelper('c', function(value, format) { return Mondo.currency(value, format); });
}

if ( typeof require !== "undefined" &&
    typeof exports !== "undefined" &&
    typeof module !== "undefined" ) {
    Mondo.env = 'node';
    Mondo.globalize = require('globalize');
    Mondo._ = require('underscore');
    Mondo.cldr = require('cldr-plurals').CLDR;
    Mondo.handlebars = require('handlebars');
    registerHandlebarHelpers();
    // Assume CommonJS
    module.exports = Mondo;
} else if ( typeof define === "function" && define.amd ) {
    Mondo.env = 'requirejs';
    define( "mondo", ['globalize', 'underscore', 'plurals', 'handlebars'], function (globalize, _, plurals, handlebars) { 
        Mondo.globalize = globalize;
        Mondo._ = _;
        Mondo.cldr = plurals;
        Mondo.handlebars = handlebars;
        registerHandlebarHelpers();
        return Mondo;
    } );
} else {
    Mondo.env = 'browser';
    Mondo.globalize = Globalize;
    Mondo._ = _;
    Mondo.cldr = CLDR;
    Mondo.handlebars = Handlebars;
    registerHandlebarHelpers();
    // Export as global variable
    window.Mondo = Mondo;
}

Mondo.format = Mondo.f = function(value, format) {
    return this.globalize.format(value,format);
};

Mondo.date = Mondo.d = function(date) {
    return this.format(date,'d');
};

Mondo.time = Mondo.t = function(time) {
    return this.format(time,'t');
};

Mondo.currency = Mondo.c = function(amount) {
    return this.format(amount,'c');
};

Mondo.percent = Mondo.p = function(number) {
    return this.format(number,'p');
};

Mondo.isoDate = Mondo.i = function(date) {
    return (date.toISOString) ? date.toISOString().split('T')[0] : this.globalize.format(date, 'yyyy-MM-dd');
};

Mondo.isoString = Mondo.I = function(date) {
    var iso = '';
    if (date.toISOString) {
        iso = date.toISOString();
    } 
    else {
         iso = date.getUTCFullYear() 
         + '-' + Mondo.format(date.getUTCMonth() + 1, 'd2')
         + '-' + Mondo.format(date.getUTCDate(), 'd2')
         + 'T' + Mondo.format(date.getUTCHours(), 'd2')
         + ':' + Mondo.format(date.getUTCMinutes(), 'd2')
         + ':' + Mondo.format(date.getUTCSeconds(), 'd2')
         + '.' + Mondo.format(date.getUTCMilliseconds(), 'd3')
         + 'Z';
    }
    return iso
};

Mondo.parseInt = function(value, radix, culture) {
    return this.globalize.parseInt(value, radix, culture)
};

Mondo.parseFloat = function(value, radix, culture) {
    return this.globalize.parseFloat(value, radix, culture)
};

Mondo.parseDate = function(value, formats, culture) {
    return this.globalize.parseDate(value, formats, culture)
};

Mondo.localize = Mondo.l = function(key, options) {
    if(this._.isNumber(options)) {
        options = { pluralize: options };
    }
    var pluralizedKey = this.pluralize(key, options);
    
    var message = this.translate(pluralizedKey);    
    return this.interpolate(pluralizedKey, message, options);    
};

Mondo.pluralize = function(key, options) {
    options = options || {};
    var pluralize = options.pluralize;
    if(pluralize || pluralize === 0) {
        var size;
        if(this._.isNumber(pluralize)) {
            size = pluralize;
        }
        else if(pluralize.length) {
            size = pluralize.length;    
        }
        else if(this._.isObject(pluralize)) {
            size = this._.size(pluralize);
        }

        return key + '.' + this.cldr.pluralForm(size, this.globalize.culture().language);
    }
    return key;
};

Mondo.translate = function(key) {
    var message = this.globalize.culture().messages;
    var path = key.split('.');
    for(var part in path) {
        message = message[path[part]];
        if(!message) return '';
    }
    return message;
};

Mondo.interpolate = function(key, message, options) {
    
    if(this._.isString(message) && message.indexOf('{{') > -1) {
        var compiled = this.handlebars.compile(message);

        var path = key.split('.');
        var tmp = this.globalize.culture().messages;
        for(var part in path) {
            if(part == path.length - 1) {
                tmp[path[part]] = compiled;
            }
            else {
                tmp = tmp[path[part]];    
            }
        }
        return compiled(options);
    }
    else if(this._.isFunction(message)) {
        return message(options);
    }
    else {
        return message;
    } 
};

Mondo.culture = function(selector) {
    return this.globalize.culture(selector);
};

Mondo.addTranslation = function(cultureName, translations) {
    this.addCultureInfo(cultureName, { messages: translations });
};

Mondo.addCultureInfo = function(cultureName, extendCultureName, info) {
    this.globalize.addCultureInfo(cultureName, extendCultureName, info);
};
}(this));