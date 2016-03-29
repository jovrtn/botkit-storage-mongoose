var should = require('should'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire').noCallThru();

// Models
var Teams = require('../src/models/teams');
var Channels = require('../src/models/channels');
var Users = require('../src/models/users');

require('should-sinon');

describe('Mongo', function() {
    var mongooseMock,
        collectionMock,
        collectionObj,
        Storage,
        config;

    beforeEach(function() {
        config = {
            mongoUri: 'http://someurl.somewhere.com'
        };

        collectionObj = {
            find: sinon.stub(),
            findOne: sinon.stub(),
            findOneAndUpdate: sinon.stub()
        };

        collectionMock = {
            get: sinon.stub().returns(collectionObj)
        };

        mongooseMock = sinon.stub().returns(collectionMock);

        Storage = proxyquire('../src/index', {
            mongoose: mongooseMock
        });
    });

    describe('Initialization', function() {
        it('should throw an error if config is missing', function() {
            Storage.should.throw('Need to provide mongo address.');
        });

        it('should throw an error if mongoUri is missing', function() {
            (function() {
                Storage({});
            }).should.throw('Need to provide mongo address.');
        });

        it('should initialize mongoose with mongoUri', function() {
            Storage(config);
            mongooseMock.callCount.should.equal(1);
            mongooseMock.args[0][0].should.equal(config.mongoUri);
        });
    });

    var zones = [{
        name: 'teams',
        model: Teams
    }, {
        name: 'channels',
        model: Channels
    }, {
        name: 'users',
        model: Users
    }];

    zones.forEach(function(zone) {
        describe(model + '.get', function() {
            it('should call findOne with callback', function() {
                var cb = sinon.stub();

                Storage(config)[model].get('walterwhite', cb);
                collectionObj.findOne.should.be.calledWith({
                    id: 'walterwhite'
                }, cb);
            });
        });

        describe(model + '.save', function() {

            it('should call findOneAndUpdate', function() {
                var data = {
                        id: 'walterwhite'
                    },
                    cb = sinon.stub();

                Storage(config)[model].save(data, cb);
                collectionObj.findOneAndUpdate.should.be.calledWith({
                        id: 'walterwhite'
                    },
                    data, {
                        upsert: true,
                        'new': true
                    },
                    cb
                );
            });
        });

        describe(model + '.all', function() {

            it('should call find', function() {
                var cb = sinon.stub();

                Storage(config)[model].all(cb);
                collectionObj.find.should.be.calledWith({}, cb);
            });
        });
    });
});
