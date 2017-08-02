describe('Karma ', function() {
  it('should test 2 + 2  equals 4 to be a success', function() {
      expect(2 + 2).toEqual(4);
  });

  it('should test `-2 + `-3` equals `-5` to be a success', function() {
      expect(-2 + -3).toEqual(-5);
  });
});
