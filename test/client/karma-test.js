describe('Check karma works ', function() {
  it('has a dummy spec to test 2 + 2', function() {
    // An intentionally failing test. No code within expect() will never equal 4.
    expect(2 + 2).toEqual(4);
  });
  it('should fail adding 1 + 9', function() {
    expect(2 + 3).toEqual(5);
  });
});
