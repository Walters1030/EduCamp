mondo
=====

Mondo has moved to a new home at codeplant (https://github.com/codeplant/mondo). Our brand new and shiny swiss based company. Visit us on codeplant.ch (http://codeplant.ch)

[![Dependency Status](https://david-dm.org/codeplant/mondo.png)](https://david-dm.org/codeplant/mondo)
[![Build](https://travis-ci.org/codeplant/mondo.png)](https://travis-ci.org/codeplant/mondo)

mondo is a i18n library for node and the browser. It features date- and number formatting, translations with string interpolation and pluralization.

see [github issues](https://github.com/codeplant/mondo/issues?milestone=2&state=open) for open task prior version 1.0.0

Under the hood
--------------

mondo uses several other libraries under the hood:

*   [globalize](https://github.com/jquery/globalize) - This library does the heavy lifting. globalize provides all the locale information for formatting and parsing.

*   [handlebars](http://handlebarsjs.com) - mondo uses handlebar templates for string interpolation

*   [CLDR.js](https://github.com/jamesarosen/CLDR.js) - provides the pluralization rules. For futher information please refer to the CLDR page on [cldr.unicode.org](http://cldr.unicode.org) 

*   [underscorejs](http://underscorejs.org) - No need to introduce this famous citizen of jsworld

Setting current locale
----------------------

`Mondo.culture('fr-FR')`

Formatting
----------

`Mondo.format(value, format)` alias: `Mondo.f(value, format)`

Formats the given value according to the format. Please see (https://github.com/jquery/globalize#format) for details and formatting patterns.

`Mondo.date(date)` alias: `Mondo.d(date)`

Shortcut for format(date, 'd') uses the short date pattern. e.g. "dd.MM.yyyy" for de-CH locale

`Mondo.time(date)` alias: `Mondo.t(date)

Shortcut for format(date, 't') uses the short time pattern. e.g. "" for de-CH locale

Defining messages for translation
---------------------------------

### addTranslations(locale, messages)

Add translation messages to the given locale (culture in globalize speak) definition.

`Mondo.addTranslations('en-US', { title: "Super awesome webapp" })`

To access the title message use:

`Mondo.localize('title')`

Nesting messages
----------------

It's possible to define nested message for a cleaner message file if lots of messages are used.

`Mondo.addTranslations('en-US', { loginForm: { labels: { username: "Username", password: "Password"}} })`

To access nested messages concatenate the single message keys by '.'

`Mondo.localize('loginForm.labels.username')`

Define pluralizable messages
-------------------------

`Mondo.addTranslations('en-US', { messageCount: {
    one: "message"
    other: "messages"
})`

Be aware languages have different rules for pluralization. English as in the above example knows only two different forms. Please refer to [cldr.unicode.org] or [CLDR.js](https://github.com/jamesarosen/CLDR.js) for further information. Allowed pluralization labels are: zero, one, two, few, many, other.

Using pluralizable messages
---------------------------

In addition to the key for the message you need to pass in the pluralization option. Don't include the pluralization label into the message key.

`Mondo.localize('messageCount', { pluralize: 1 })` or `localize('messageCount', { pluralize: 2 });`

Allowed values for the pluralize option are:

* Numbers
* Every object containing a length attribute or function, like Arrays.
* Every object containing a size attribute or function.
* Simple objects. The number of attributes is used.

Shortcut if no other options need to be passed:

`Mondo.localize('messageCount', 1)`

Define interpolation
------------------------------

Handlebars templates can be used to define interpolatable messages.

`Mondo.addTranslations('de-DE', { loggedInUser: "Sie sind eingeloggt als {{loginName}}"});`

Using interpolation:

`Mondo.localize("loggedInUser", { loginName: "lchngr" })`

All options passed to the localize function passed to the handlebars template except the pluralize option.

Helpers:

* `{{d date}}` Formats the given date as a localized date
* `{{t time}}` Formats the given date as a localized time
* `{{p number}}` Formats the given number as percentage. e.g. n=1.23 --> '123%'
* `{{c amount}}` Formats the given amount as localized currency a=123 --> 'Fr. 123'
* `{{f value format}}` Formats the given value into the given format string. For details see: [globalize](https://github.com/jquery/globalize)
