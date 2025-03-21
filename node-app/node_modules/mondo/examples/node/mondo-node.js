var Mondo = require('mondo');

//Init original globalize cultures
require('globalize/lib/cultures/globalize.culture.de-CH');
require('globalize/lib/cultures/globalize.culture.fr-CH');

//Add translations
Mondo.addTranslation('de-CH',{ foo: 'das isch z foo', bar: { one: 'bar', other: 'bars'}});
Mondo.addTranslation('fr-CH',{ foo: "c'est trop foo"});

//Setting culture to be used
Mondo.culture('de-CH');

console.log(Mondo.l('foo'));
console.log(Mondo.l('bar', { pluralize: 0}));
console.log(Mondo.l('bar', { pluralize: 1}));
console.log(Mondo.l('bar', { pluralize: 2}));