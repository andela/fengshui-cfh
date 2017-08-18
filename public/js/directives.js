angular.module('mean.directives', [])
  .directive('player', () => (
    {
      restrict: 'EA',
      templateUrl: '/views/player.html',
      link: (scope) => {
        scope.colors = [
          'rgba(124,228,232,0.5)',
          'rgba(255,255,165,0.5)',
          'rgba(252,87,94,0.5)',
          'rgba(242,173,255,0.5)',
          'rgba(57,142,196,0.5)',
          'rgba(140,255,149,0.5)'];
      }
    }
  ))
  .directive('answers', () => (
    {
      restrict: 'EA',
      templateUrl: '/views/answers.html',
      link: (scope) => {
        scope.$watch('game.state', () => {
          if (scope.game.state === 'winner has been chosen') {
            const curQ = scope.game.curQuestion;
            const curQuestionArr = curQ.text.split('_');
            const startStyle = `<span style='color: ${scope.colors[scope.game.players[scope.game.winningCardPlayer].color]}'>`;
            const endStyle = '</span>';
            let shouldRemoveQuestionPunctuation = false;
            const removePunctuation = (cardIndex) => {
              let cardText = scope.game.table[scope.game.winningCard].card[cardIndex].text;
              if (cardText.indexOf('.', cardText.length - 2) === cardText.length - 1) {
                cardText = cardText.slice(0, cardText.length - 1);
              } else if ((cardText.indexOf('!', cardText.length - 2) === cardText.length - 1 ||
                cardText.indexOf('?', cardText.length - 2) === cardText.length - 1) &&
                cardIndex === curQ.numAnswers - 1) {
                shouldRemoveQuestionPunctuation = true;
              }
              return cardText;
            };
            if (curQuestionArr.length > 1) {
              let cardText = removePunctuation(0);
              curQuestionArr.splice(1, 0, startStyle + cardText + endStyle);
              if (curQ.numAnswers === 2) {
                cardText = removePunctuation(1);
                curQuestionArr.splice(3, 0, startStyle + cardText + endStyle);
              }
              curQ.text = curQuestionArr.join('');

              if (shouldRemoveQuestionPunctuation) {
                if (curQ.text.indexOf('.', curQ.text.length - 2) === curQ.text.length - 1) {
                  curQ.text = curQ.text.slice(0, curQ.text.length - 2);
                }
              }
            } else {
              curQ.text += ` ${startStyle} ${scope.game.table[scope.game.winningCard].card[0].text} ${endStyle}`;
            }
          }
        });
      }
    }
  ))
  .directive('question', () => (
    {
      restrict: 'EA',
      templateUrl: '/views/question.html',
      link: () => {}
    }
  ))
  .directive('modal', () => (
    {
      template: '<div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" ng-click="hideModal()" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 id="mtitle"></h4></div><div class="modal-body" ng-transclude></div></div></div></div>',
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: true,
      link: function postLink(scope, element, attrs) {
        scope.$watch(attrs.visible, (value) => {
          if (value === true) {
            $(element).modal('show');
          } else {
            $(element).modal('hide');
          }
        });
        scope.$watch(attrs.message, (value) => {
          const span = angular.element('<span />');
          span.text(value);
          element.find('h4').append(span);
        });
        $(element).on('shown.bs.modal', () => {
          scope.$apply(() => {
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', () => {
          scope.$apply(() => {
            scope.$parent[attrs.visible] = false;
          });
        });
      }
    }
  ))
  .directive('timer', () => (
    {
      restrict: 'EA',
      templateUrl: '/views/timer.html',
      link: () => {}
    }
  ))
  .directive('landing', () => (
    {
      restrict: 'EA',
      link: (scope) => {
        scope.showOptions = true;
        if (scope.$$childHead.global.authenticated === true) {
          scope.showOptions = false;
        }
      }
    }
  ));
