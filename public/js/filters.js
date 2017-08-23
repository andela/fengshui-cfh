angular.module('mean.system')
  .filter('upperFirstLetter', () => (
    (input) => {
      input = input || '';
      return input.charAt(0).toUpperCase() + input.slice(1);
    }
  ))
  .filter('addFriends', () => (
    (input, friendsEmail) => {
      if (friendsEmail.includes(input)) {
        return 'Unfriend';
      }
      return 'Add Friend';
    }
  ));
