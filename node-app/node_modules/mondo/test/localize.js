var Mondo = require('mondo');
var chai = require('chai');
var should = require('chai').should();

describe('localize()', function() {
    
    before(function() {
        
        require('globalize/lib/cultures/globalize.culture.en-US');

        Mondo.culture('en-US');
        Mondo.addTranslation('en-US', { message: 'Message', 
        inboxStatus: {
            one: 'You have one messge in your inbox',
            other: 'You have {{messageCount}} messages in your inbox'
        }});

    });


    it('should return the localized message', function() {
        var localized = Mondo.localize('message');
        localized.should.eq('Message');
    });

    describe('pluralized messages', function(){

        it('should return the pluralized message', function() {
            var pluralized = Mondo.localize('inboxStatus', 1);
            pluralized.should.eq('You have one messge in your inbox');

            pluralized = Mondo.localize('inboxStatus', { pluralize: 1});
            pluralized.should.eq('You have one messge in your inbox');

            pluralized = Mondo.localize('inboxStatus', { pluralize: 0, messageCount: 0});
            pluralized.should.eq('You have 0 messages in your inbox');

            pluralized = Mondo.localize('inboxStatus', { pluralize: 2, messageCount: 2});
            pluralized.should.eq('You have 2 messages in your inbox');
        });

    });
});