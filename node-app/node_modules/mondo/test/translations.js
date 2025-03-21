var Mondo = require('mondo');
var chai = require('chai');
var should = require('chai').should();

describe('adding translations', function() {

    before(function(){
        require('globalize/lib/cultures/globalize.culture.de-CH');
        Mondo.culture('de-CH');
    });

    it('should make translation available', function() {

        Mondo.addTranslation('de-CH', { foo: { title: "bar" }});
        var translation = Mondo.localize('foo.title');
        translation.should.equal('bar');    

    });

    it('should make replaced translation available', function() {

        Mondo.addTranslation('de-CH', { toBeReplaced: { title: "bar" }});
        Mondo.addTranslation('de-CH', { toBeReplaced: { title: "replacement" }});
        var translation = Mondo.localize('toBeReplaced.title');
        translation.should.equal('replacement');    

    });

    it('should merge new translations to existing', function() {

        Mondo.addTranslation('de-CH', { foo: { title: "bar" }});
        Mondo.addTranslation('de-CH', { foo: { subtitle: "subbar" }});
        Mondo.addTranslation('de-CH', { foo2: { title: "bar2" }});
        
        Mondo.localize('foo.subtitle').should.equal('subbar');
        Mondo.localize('foo2.title').should.equal('bar2');
        Mondo.localize('foo.title').should.equal('bar');
    });

});