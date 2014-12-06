"use strict";

var parseURL = 'https://api.parse.com/1/classes/comments';

angular.module('ReviewApp', ['ui.bootstrap'])
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'SjXsHgTHENtiwNVXIAoiXJEClhjFbjT7aeQPKMz2';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'kt7nrx4KnwWLN5bc0Dlp6wl1voSdMCDhxScE6S2G';
    })
    .controller('ReviewController', function($scope, $http) {
        $scope.comments = [];
        $scope.errorMessage = null;

        $scope.addComment = function() {
            $scope.loading = true;

            $http.post(parseURL, $scope.newComment)
                .success(function(responseData) {
                    $scope.newComment.objectId = responseData.objectId;
                    $scope.comments.push($scope.newComment);
                    $scope.newComment = {
                        rating: 1,
                        name: '',
                        title: '',
                        body: '',
                        score: 0
                    };
                })
                .error(function(err) {
                    $scope.errorMessage = err;
                })
                .finally(function() {
                    $scope.loading = false;
                });
        }; //addComment()

        $scope.getComments = function() {
            $scope.loading = true;

            $http.get(parseURL)
                .success(function(data) {
                    $scope.comments = _.sortBy(data.results, 'score').reverse();
                })
                .error(function(err) {
                    $scope.errorMessage = err;
                })
                .finally(function() {
                    $scope.loading = false;
                });
        }; //getComments()

        $scope.getComments();

        $scope.newComment = {
            rating: 1,
            name: '',
            title: '',
            body: '',
            score: 0
        };
        $scope.incrementingScore = function(comment, value) {
            $http.put(parseURL + '/' + comment.objectId, {
                    score: {
                        __op: 'Increment',
                        amount: value
                    }
                })
                .success(function(responseData) {
                    if (responseData.score < 0) { //if two people vote on the same thing, stop it from going below 0
                        $scope.incrementingScore(comment, 1);
                    } else {
                        comment.score = responseData.score;
                    }
                })
                .error(function(err) {
                    $scope.errorMessage = err;
                });
        }; //incrementingScore()

        $scope.deleteComment = function(comment) {
                $scope.loading = true;
                $http.delete(parseURL + '/' + comment.objectId)
                    .success(function() {
                        $scope.getComments();
                    })
                    .error(function(err) {
                        $scope.errorMessage = err;
                    })
                    .finally(function() {
                        $scope.loading = false;
                    });
            } //deleteComment()
    });