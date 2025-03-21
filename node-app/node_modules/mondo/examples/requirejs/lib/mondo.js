(function(window, undefined) {

var Mondo;

Mondo = function() {};

if ( typeof require !== "undefined" &&
    typeof exports !== "undefined" &&
    typeof module !== "undefined" ) {
    Mondo.env = 'node';
    Mondo.globalize = require('globalize');
    Mondo._ = require('underscore');
    Mondo.cldr = require('cldr-plurals').CLDR;
    Mondo.handlebars = require('handlebars');
    // Assume CommonJS
    module.exports = Mondo;
} else if ( typeof define === "function" && define.amd ) {
    Mondo.env = 'requirejs';
    define( "mondo", ['globalize', 'underscore', 'plurals', 'handlebars'], function (globalize, _, plurals, handlebars) { 
        Mondo.globalize = globalize;
        Mondo._ = _;
        Mondo.cldr = plurals;
        Mondo.handlebars = handlebars;
        return Mondo;
    } );
} else {
    Mondo.env = 'browser';
    Mondo.globalize = Globalize;
    Mondo._ = _;
    Mondo.cldr = CLDR;
    Mondo.handlebars = Handlebars;
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
    var pluralizedKey = this.pluralize(key, options);
    var message = this.translate(pluralizedKey);    
    return this.interpolate(message, options);
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

Mondo.interpolate = function(source, options) {
    return this.handlebars.compile(source)(options);
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