var xmlController = angular.module("xmlController",[])
.controller("xml",["$scope", "$http", function($scope, $http){
  $scope.xmlString = undefined;
  $http({
          url:'data/xml.json',
          method:"GET",
          responseType:"text"
        }).then(function(response){
    $scope.xmlString = response.data.join('');
  },
  function(failResponse){
    alert(failResponse);
  });
    
  $scope.nodeClick = function (e, id, self){
    var element = document.getElementById(id);
    var action = element.innerText == '+' ? 'close':'open';
    element.innerText = action=='close'?'-':'+';
    element.parentElement.children[2].style.display= action == 'close'?'none':'list-item';
    
    for(var i = 0; i< self.parentElement.children.length; i++)
    {
      if(parseInt(self.innerText) < parseInt(self.parentElement.children[i].innerText))
        self.parentElement.children[i].style.display = action=='close'?'none':'block';
    }
    e.preventDefault();
    e.stopPropagation();
  }

//  $scope.parseXml($scope.xmlString);
  
}]);