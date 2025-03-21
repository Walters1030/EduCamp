var Mondo = require('mondo');
var chai = require('chai');
var should = require('chai').should();

describe('pluralize', function() {

    before(function() {
        require('globalize/lib/cultures/globalize.culture.de-CH');
        Mondo.culture('de-CH');
    });

    describe('number as pluralize option', function() {

        it('should return pluralized key', function() {

            var key = Mondo.pluralize('foo', { pluralize: 0 });
            key.should.equal('foo.other');
            key = Mondo.pluralize('foo', { pluralize: 1 });
            key.should.equal('foo.one');
            key = Mondo.pluralize('foo', { pluralize: 2 });
            key.should.equal('foo.other');

        });
    });

    describe('objects with length attribute as pluralize option', function() {

        it('should return pluralized key', function() {

            var key = Mondo.pluralize('foo', { pluralize: [] });
            key.should.equal('foo.other');
            key = Mondo.pluralize('foo', { pluralize: [1] });
            key.should.equal('foo.one');
            key = Mondo.pluralize('foo', { pluralize: [1,2] });
            key.should.equal('foo.other');    

        });
    });

    describe('objects with length attribute as pluralize option', function() {

        it('should return pluralized key', function() {

            var key = Mondo.pluralize('foo', { pluralize: {} });
            key.should.equal('foo.other');
            key = Mondo.pluralize('foo', { pluralize: { bar1: 1 } });
            key.should.equal('foo.one');
            key = Mondo.pluralize('foo', { pluralize: { bar1: 1, bar2: 2} });
            key.should.equal('foo.other');    

        });
    });

    describe('without pluralize option', function() {

        it('should return the key unchanged', function() {
            var key = Mondo.pluralize('foo', { bar: 1 });
            key.should.equal('foo');
            key = Mondo.pluralize('foo');
            key.should.equal('foo');
        });
    });
});