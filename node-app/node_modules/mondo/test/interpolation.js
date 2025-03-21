var Mondo = require('mondo');
var chai = require('chai');
var should = require('chai').should();
var expect = require('chai').expect;

describe('interpolation', function() {

    before(function(){
        require('globalize/lib/cultures/globalize.culture.de-CH');
        Mondo.culture('de-CH');
    });
    
    
    it('should replace placeholders', function() {

        Mondo.addTranslation('de-CH', { foo: '**{{bar}}**' });
        Mondo.localize('foo', {bar: 'test'}).should.equal('**test**');
        Mondo.localize('foo', {bar: 1}).should.equal('**1**');
        
    });

    it('should cache compiled handlebar messages', function() {
        
        Mondo.addTranslation('de-CH', { toBeCached: '**{{foo}}**' });
        expect(Mondo.culture().messages.toBeCached).to.be.a('string');
        Mondo.localize('toBeCached', { foo: 'Foo' });
        expect(Mondo.culture().messages.toBeCached).to.be.a('function');

    });
    
    describe('handlebar helpers', function(){
        
        describe('date helper', function() {

            it('should format the given as date short date', function(){

                Mondo.addTranslation('de-CH', { dateHelper: '{{d date}}' });
                var d = new Date('2013-08-27');
                var s = Mondo.localize('dateHelper', { date: d});
                s.should.eq('27.08.2013');

            });
        });

        describe('time helper', function() {

            it('should format the given date as short time', function(){

                Mondo.addTranslation('de-CH', { timeHelper: '{{t time}}' });
                var d = new Date();
                d.setHours(8,15);
                var s = Mondo.localize('timeHelper', { time: d});
                s.should.eq('08:15');

            });
        });

        describe('percent helper', function() {

            it('should format the given number as percentage', function(){

                Mondo.addTranslation('de-CH', { percentHelper: '{{p number}}' });
                var n = 1.23;
                var s = Mondo.localize('percentHelper', { number: n});
                s.should.eq('123.00%');

            });
        });

        describe('currency helper', function() {

            it('should format the given number as currency', function(){

                Mondo.addTranslation('de-CH', { currencyHelper: '{{c amount}}' });
                var a = 123;
                var s = Mondo.localize('currencyHelper', { amount: a});
                s.should.eq('Fr. 123.00');

            });
        });

        describe('format helper', function() {

            it('should format the given date as short date', function(){

                Mondo.addTranslation('de-CH', { formatHelper: '{{f date "dd.MM.yyyy"}}' });
                var d = new Date('2013-08-27');
                var s = Mondo.localize('formatHelper', { date: d});
                s.should.eq('27.08.2013');

            });

            it('should format the given date as short time', function(){

                Mondo.addTranslation('de-CH', { formatHelper: '{{f time "hh:mm"}}' });
                var d = new Date();
                d.setHours(8,15);
                var s = Mondo.localize('formatHelper', { time: d});
                s.should.eq('08:15');

            });

            it('should format the given number as short time', function(){

                Mondo.addTranslation('de-CH', { formatHelper: '{{f number "n2"}}' });
                var n = 3.141
                var s = Mondo.localize('formatHelper', { number: n});
                s.should.eq('3.14');

            });
        });
    });
 }); 