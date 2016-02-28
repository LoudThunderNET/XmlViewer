var xmlController = angular.module("xmlViewer",['ngSanitize'])
.directive("xmlViewer", ['$timeout', '$compile', function($timeout, $compile){
  var recurScan = function(dom, curRowNum, lines, level, parent){
    curRowNum ++;
    var linesElement = {
                        ID          : curRowNum,
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
                  ID          : curRowNum,
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
  var buildElement = function(scope, element){
    var table = {}
    var spanChildren = [];
    var span = {};
    var tr = {};
    var td = {};
    var div = {};
    var endRow = {};
    var line = {};
    table = angular.element(element[0].children[0].children[0].children[0].children[0]);
    for(var i=0; i<scope.Lines.length; i++){
      line = scope.Lines[i];
      tr = angular.element('<tr>').addClass('rowN fnt ht').attr('id','tab1Row'+i)
      tr.append(angular.element('<td>').addClass('rowNum').text(''+(i+1)));
      td = angular.element('<td>').addClass(!line.HasChildren?'rowNNode ht':(!line.LeafClosed?'rowMNode pnt ht':'rowPNode pnt ht')).html('&nbsp;');
      if(line.HasChildren)
        td.on('click', function(e){scope.onNodeClick(e)});
      tr.append(td);
      table.append(tr);
    }
    
    table = angular.element(element[0].children[0].children[1].children[0].children[0]);
    for(var i=0; i<scope.Lines.length; i++){
      span = angular.element('<span>').addClass('fnt');
      span.append(angular.element('<div>').css('float','left').html(scope.Lines[i].Tab));
      if(scope.Lines[i].StartDomNode !== undefined){
        div = angular.element('<div>').addClass('elDiv ht');
        div.append(angular.element('<div>').addClass('ang').text('<'));
        div.append(angular.element('<div>').addClass('el').text(scope.Lines[i].StartDomNode.localName));
        // insert atrributes generation
        if(scope.Lines[i].StartDomNode.attributes.length>0){
          var attr = {};
          for(var attrIndex = 0; attrIndex<scope.Lines[i].StartDomNode.attributes.length; attrIndex++){
            attr = angular.element('<div>').addClass('attDiv').html('&nbsp;');
            attr.append(angular.element('<div>').addClass('spAtr').text(scope.Lines[i].StartDomNode.attributes[attrIndex].nodeName));
            attr.append(angular.element('<div>').addClass('val').text('='));
            attr.append(angular.element('<div>').addClass('quo').text('"'));
            attr.append(angular.element('<div>').addClass('val').text(scope.Lines[i].StartDomNode.attributes[attrIndex].nodeValue));
            attr.append(angular.element('<div>').addClass('quo').text('"'));
            div.append(attr);
          }
        }
        div.append(angular.element('<div>').addClass('ang').text('>'));
        endRow = angular.element('<div>').addClass(scope.Lines[i].LeafClosed ? 'endRowS': 'endRowH').attr('id','endRow'+scope.Lines[i].StartRownumber);
        if(scope.Lines[i].HasChildren){
          endRow.append(angular.element('<div>').addClass('elDiv ht').text('...'));
          var divElDiv = angular.element('<div>').addClass('elDiv ht'); 
          divElDiv.append(angular.element('<div>').addClass('ang').text('</'));
          divElDiv.append(angular.element('<div>').addClass('el').text(scope.Lines[i].StartDomNode.localName));
          divElDiv.append(angular.element('<div>').addClass('ang').text('>'));
          endRow.append(divElDiv);
          div.append(endRow);
        }
        span.append(div);
      }
      if(scope.Lines[i].EndDomNode !== undefined && scope.Lines[i].StartDomNode !== undefined){
        span.append(angular.element('<div>').addClass('elDiv ht').text(scope.Lines[i].EndDomNode.textContent));
      }
      if(scope.Lines[i].EndDomNode !== undefined){
        var div = angular.element('<div>').addClass('elDiv ht');
        div.append(angular.element('<div>').addClass('ang').text('</'));
        div.append(angular.element('<div>').addClass('el').text(scope.Lines[i].EndDomNode.localName));
        div.append(angular.element('<div>').addClass('ang').text('>'))
        span.append(div);
      }
      tr = angular.element('<tr>').addClass('rowN fnt ht').attr('id','tab2Row'+i)
                .append( angular.element('<td>').addClass('xmlCont')
                        .append( angular.element('<div>').addClass('xmlRow ht').attr('id','row'+i)
                          .append(span)));
      table.append(tr);
    }
    element[0].children[0].style.display = "block";
    scope.timeStamp2 = Date.now();
    console.log(scope.timeStamp2 - scope.timeStamp1);
  };

  dObject = {
    restrict:"E",
    transclude:true,
    scope:{
      xml:"=",
      dom:"="
    },
    templateUrl:'views/xmlViewer.html',
    link: function(scope, element, attrs, controller){
      scope.$watch('xml', function(newValue, oldValue){
        if(newValue == oldValue)
           return;
        // парсим строку в DOM
        scope.timeStamp1 = Date.now();
        if(scope.dom == undefined && scope.xml !== undefined && scope.xml.length > 0){
          var oParser = new DOMParser();
          var oDOM = oParser.parseFromString(scope.xml, "text/xml");
          scope.dom = oDOM.documentElement;
        }
        // инициализируем массив для сворачивания строк
        scope.Lines = [];
        recurScan(scope.dom, 0, scope.Lines, 1);
        scope.Lines = scope.Lines.sort(function(a,b){
          return a.StartRownumber > b.StartRownumber ? 1 : (a.StartRownumber < b.StartRownumber ? -1 : 0);
        });
        buildElement(scope, element);
      });
    },
    controller:['$scope', function($scope){

      $scope.onNodeClick = function(e){
        var index = parseInt(e.currentTarget.parentElement.cells[0].innerText)-1;
        var node = $scope.Lines[index];
        node.LeafClosed = !node.LeafClosed
        var el = document.getElementById('endRow'+node.StartRownumber);
        for(var i = node.StartRownumber ; i < node.EndRowNumber; i++)
        {
          var row1 = document.getElementById('tab1Row'+i);
          var row2 = document.getElementById('tab2Row'+i);
          if(node.ID == $scope.Lines[i].Parent.ID)
            $scope.Lines[i].RowVisible = !node.LeafClosed;
          else
            if(!node.LeafClosed && !$scope.Lines[i].Parent.LeafClosed)
              $scope.Lines[i].RowVisible = !node.LeafClosed;
            else
              if(node.LeafClosed)
                $scope.Lines[i].RowVisible = !node.LeafClosed;
          var trDisplayValue = $scope.Lines[i].RowVisible ? 'table-row':'none';
          row1.style.display=trDisplayValue;
          row2.style.display=trDisplayValue;
        }
        if(el !== undefined && el !== null)
          el.style.display = node.LeafClosed ? 'block':'none';
        e.currentTarget.className = !node.LeafClosed?'rowMNode pnt ht':'rowPNode pnt ht';
      };
    }]
  };
  return dObject;
}]);