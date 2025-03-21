require.config({
    debs: ['mondo-require'],
    paths: {
        'jquery': 'lib/jquery',
        'underscore': 'lib/underscore',
        'handlebars':'lib/handlebars',
        'globalize':'lib/globalize',
        'plurals':'lib/plurals',
        'mondo':'lib/mondo',
        'culture-de-CH':'lib/cultures/globalize.culture.de-CH'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'plurals': {
            exports: 'CLDR'
        },
        'handlebars': {
            exports: 'Handlebars'
        },
        'globalize': {
            exports: 'Globalize'
        },
        'culture-de-CH': {
            deps: ['globalize']
        }
    }
});

define('mondo-require',['jquery','mondo','de-CH'], function($,Mondo){
    Mondo.culture('de-CH');
    $('body').append(Mondo.l('foo'));
});