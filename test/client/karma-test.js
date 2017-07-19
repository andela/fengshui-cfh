describe('Karma ', () => {
  it('should test 2 + 2  equals 4 to be a success', () => {
      expect(2 + 2).toEqual(4);
  });

  it('should test `a` + `b` equals `ab` to be a success', () => {
      expect('a' + 'b').toEqual('ab');
  });
});

feat(setup karma and jasmine for testing angular): setup unit testing for angular

 - install all the required karma and jasmine packages(new packages in package.json)
 - add a my.conf.js file in application root folder
 - add a client folder to test folder
 - add a karma-test.js file containing sample tests(passing) to test/client folder
 - add a npm script for running angular/frontend tests
[Delivers #148328307]