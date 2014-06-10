'use strict';

describe('Service: Insightly', function () {

  // load the service's module
  beforeEach(module('rustApp'));

  // instantiate service
  var Insightly;
  beforeEach(inject(function (_Insightly_) {
    Insightly = _Insightly_;
  }));

  it('should do something', function () {
    expect(!!Insightly).toBe(true);
  });

});
