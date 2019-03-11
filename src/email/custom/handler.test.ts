import * as assert from 'assert'


describe('someFunction', function() {
    it('should do this', function() {
        assert(true)
    })
    it('should do that', function() {
        assert(true)
    })
    it('shold fail when this happens', function() {
        assert.deepEqual(2 + 2, 5);
    })
})