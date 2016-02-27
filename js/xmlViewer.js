var xmlController = angular.module("xmlViewer",['ngSanitize'])
.directive("xmlViewer", ['$timeout', function($timeout){
  var recurScan = function(dom, curRowNum, lines, level, parent){
    curRowNum ++;
    var linesElement = {
                        StartDomNode: dom,
                        StartRownumber: curRowNum, 
                        EndRowNumber:undefined, 
                        HasChildren: dom.children.length > 0,
                        EndDomNode:dom.children.length > 0 ? undefined : dom,
                        Level :level,
                        Tab   :level > 0?"&nbsp;".repeat(level):"",
                        LeafClosed:false,
                        RowVisible:true,
                        Parent : parent
                       };
    for(var i=0; i< dom.children.length; i++)
    {
      curRowNum = recurScan(dom.children[i], curRowNum, lines, level+1, linesElement);
    }
    linesElement.EndRowNumber = curRowNum;
    lines.push(linesElement);
    if(linesElement.HasChildren)
    {
      curRowNum ++;
      lines[lines.length-1].EndRowNumber = curRowNum;
      lines.push({
                  StartDomNode: undefined,
                  StartRownumber: curRowNum, 
                  EndRowNumber:curRowNum, 
                  HasChildren: false,
                  EndDomNode:dom,
                  Level:level,
                  Tab   :linesElement.Tab,
                  LeafClosed:false,
                  RowVisible:true,
                  Parent : linesElement
                });
    }
    return curRowNum;
  };
/*  var recurBuild = function(dom, ){
    
  };*/
  dObject = {
    restrict:"E",
    transclude:true,
    scope:{
      xml:"=",
      dom:"="
    },
    templateUrl:'views/xmlViewer.html',
    link: function(scope, element, attrs, controller){
            $timeout(function(){
              scope.timeStamp2 = Date.now();
              console.log(scope.timeStamp2 - scope.timeStamp1);
            });
    },
    controller:['$scope', function($scope){
      $scope.$watch('xml', function(newValue, oldValue){
        if(newValue == oldValue)
           return;
        // парсим строку в DOM
        $scope.timeStamp1 = Date.now();
        if($scope.dom == undefined && $scope.xml !== undefined && $scope.xml.length > 0){
          var oParser = new DOMParser();
          var oDOM = oParser.parseFromString($scope.xml, "text/xml");
          $scope.dom = oDOM.documentElement;
        }
        // инициализируем массив для сворачивания строк
        $scope.Lines = [];
        recurScan($scope.dom, 0, $scope.Lines, 1);
        $scope.Lines = $scope.Lines.sort(function(a,b){
          return a.StartRownumber > b.StartRownumber ? 1 : (a.StartRownumber < b.StartRownumber ? -1 : 0);
        });
        
      });

      $scope.onNodeClick = function(node, lines){
        node.LeafClosed = !node.LeafClosed
        for(var i = node.StartRownumber ; i < node.EndRowNumber; i++)
        {
          if(node.$$hashKey == lines[i].Parent.$$hashKey)
            lines[i].RowVisible = !node.LeafClosed;
          else
            if(!node.LeafClosed && !lines[i].Parent.LeafClosed)
              lines[i].RowVisible = !node.LeafClosed;
            else
              if(node.LeafClosed)
                lines[i].RowVisible = !node.LeafClosed;
        }
      };
    }]
  };
  return dObject;
}]);