angular.module('app').directive('chordDiagram', ['$window', 'matrixFactory',

function ($window, matrixFactory) {

  var link = function ($scope, $el, $attr) {

    var size = [750, 750]; // SVG SIZE WIDTH, HEIGHT
    var marg = [50, 50, 50, 50]; // TOP, RIGHT, BOTTOM, LEFT
    var dims = []; // USABLE DIMENSIONS
    dims[0] = size[0] - marg[1] - marg[3]; // WIDTH
    dims[1] = size[1] - marg[0] - marg[2]; // HEIGHT

    var colors = d3.scale.ordinal()
      //.domain(['Green','Red','Black','Gray','Orange','Blue'])
      .domain(["Airport","Alewife","Allston Street","Andrew","Aquarium","Arlington","Ashmont","Assembly","Babcock Street","Back Bay","Back of the Hill","Beachmont","Beaconsfield","Blandford Street","Boston College","Boston Univ. Central","Boston Univ. East","Boston Univ. West","Bowdoin","Boylston","Braintree","Brandon Hall","Brigham Circle","Broadway","Brookline Hills","Brookline Village","Butler","Capen Street","Cedar Grove","Central","Central Ave.","Charles/MGH","Chestnut Hill","Chestnut Hill Ave.","Chinatown","Chiswick Road","Cleveland Circle","Community College","Coolidge Corner","Copley","Courthouse","Davis","Dean Road","Downtown Crossing","Eliot","Englewood Ave.","Fairbanks Street","Fenway","Fenwood Road","Fields Corner","Forest Hills","Government Center","Green Street","Griggs Street","Harvard","Harvard Ave.","Hawes Street","Haymarket","Heath Street","Hynes Convention Center","Jackson Square","JFK/Umass","Kendall/MIT","Kenmore","Kent Street","Lechmere","Longwood","Longwood Medical Area","Malden Center","Massachusetts Ave.","Mattapan","Maverick","Milton","Mission Park","Museum of Fine Arts","Newton Centre","Newton Highlands","North Quincy","North Station","Northeastern University","Oak Grove","Orient Heights","Packards Corner","Park Street","Pleasant Street","Porter","Prudential","Quincy Adams","Quincy Center","Reservoir","Revere Beach","Riverside","Riverway","Roxbury Crossing","Ruggles","Saint Mary Street","Saint Paul Street","Savin Hill","Science Park","Shawmut","South Station","South Street","State Street","Stony Brook","Suffolk Downs","Sullivan Square","Summit Ave.","Sutherland Road","Symphony","Tappan Street","Tufts Medical Center","Valley Road","Waban","Warren Street","Washington Square","Washington Street","Wellington","Wollaston","Wonderland","Wood Island","Woodland","World Trade Center"])
      .range(["#204b8c","#d03b32","#387f4a","#d03b32","#204b8c","#387f4a","#d03b32","#d47638","#387f4a","#d47638","#387f4a","#204b8c","#387f4a","#387f4a","#387f4a","#387f4a","#387f4a","#387f4a","#204b8c","#387f4a","#d03b32","#387f4a","#387f4a","#d03b32","#387f4a","#387f4a","#d03b32","#d03b32","#d03b32","#d03b32","#d03b32","#d03b32","#387f4a","#387f4a","#d47638","#387f4a","#387f4a","#d47638","#387f4a","#387f4a","#7f868b","#d03b32","#387f4a","#000000","#387f4a","#387f4a","#387f4a","#387f4a","#387f4a","#d03b32","#d47638","#000000","#d47638","#387f4a","#d03b32","#387f4a","#387f4a","#387f4a","#387f4a","#387f4a","#d47638","#d03b32","#d03b32","#387f4a","#387f4a","#387f4a","#387f4a","#387f4a","#d47638","#d47638","#d03b32","#204b8c","#d03b32","#387f4a","#387f4a","#387f4a","#387f4a","#d03b32","#387f4a","#387f4a","#d47638","#204b8c","#387f4a","#000000","#387f4a","#d03b32","#387f4a","#d03b32","#d03b32","#387f4a","#204b8c","#387f4a","#387f4a","#d47638","#d47638","#387f4a","#387f4a","#d03b32","#387f4a","#d03b32","#d03b32","#387f4a","#204b8c","#d47638","#204b8c","#d47638","#387f4a","#387f4a","#387f4a","#387f4a","#d47638","#d03b32","#387f4a","#387f4a","#387f4a","#387f4a","#d47638","#d03b32","#204b8c","#204b8c","#387f4a","#7f868b"])
      //.range(['#387f4a','#d03b32','#000000','#C9BEB9','#d47638','#204b8c'])
    var chord = d3.layout.chord()
      .padding(0.02)
      .sortGroups(d3.descending)
      .sortSubgroups(d3.ascending);

    var matrix = matrixFactory.chordMatrix()
      .layout(chord)
      .filter(function (item, r, c) {
        return (item.importer1 === r.name && item.importer2 === c.name) ||
               (item.importer1 === c.name && item.importer2 === r.name);
      })
      .reduce(function (items, r, c) {
        var value;
        if (!items[0]) {
          value = 0;
        } else {
          value = items.reduce(function (m, n) {
            if (r === c) {
              return m + (n.flow1);
            } else {
              return m + (n.importer1 === r.name ? n.flow1 : n.flow1);
            }
          }, 0);
        }
        return {value: value, data: items};
      });

    var innerRadius = (dims[1] / 2) - 100;

    var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(innerRadius + 20);

    var path = d3.svg.chord()
      .radius(innerRadius);

    var svg = d3.select($el[0]).append("svg")
      .attr("class", "chart")
      .attr({width: size[0] + "px", height: size[1] + "px"})
      .attr("preserveAspectRatio", "xMinYMin")
      .attr("viewBox", "0 0 " + size[0] + " " + size[1]);

    var container = svg.append("g")
      .attr("class", "container")
      .attr("transform", "translate(" + ((dims[0] / 2) + marg[3]) + "," + ((dims[1] / 2) + marg[0]) + ")");

    var messages = svg.append("text")
      .attr("class", "messages")
      .attr("transform", "translate(10, 10)")
      .text("Updating...");

    $scope.drawChords = function (data) {

      messages.attr("opacity", 1);
      messages.transition().duration(1000).attr("opacity", 0);

      matrix.data(data)
        .resetKeys()
        .addKeys(['importer1', 'importer2'])
        .update()

      var groups = container.selectAll("g.group")
        .data(matrix.groups(), function (d) { return d._id; });
      
      var gEnter = groups.enter()
        .append("g")
        .attr("class", "group");

      gEnter.append("path")
        .style("pointer-events", "none")
        .style("fill", function (d) { return colors(d._id); })
        .attr("d", arc);
 
      gEnter.append("text")
        .attr("dy", ".35em")
        .on("click", groupClick)
        .on("mouseover", dimChords)
        .on("mouseout", resetChords)
        .text(function (d) {
          return d._id;
        });

      groups.select("path")
        .transition().duration(2000)
        .attrTween("d", matrix.groupTween(arc));

      groups.select("text")
        .transition()
        .duration(2000)
        .attr("transform", function (d) {
          d.angle = (d.startAngle + d.endAngle) / 2;
          var r = "rotate(" + (d.angle * 180 / Math.PI - 90) + ")";
          var t = " translate(" + (innerRadius + 26) + ")";
          return r + t + (d.angle > Math.PI ? " rotate(180)" : " rotate(0)"); 
        })
        .attr("text-anchor", function (d) {
          return d.angle > Math.PI ? "end" : "begin";
        });

      groups.exit().select("text").attr("fill", "orange");
      groups.exit().select("path").remove();

      groups.exit().transition().duration(1000)
        .style("opacity", 0).remove();

      var chords = container.selectAll("path.chord")
        .data(matrix.chords(), function (d) { return d._id; });

      chords.enter().append("path")
        .attr("class", "chord")
        .style("fill", function (d) {
          return colors(d.source._id);
        })
        .attr("d", path)
        .on("mouseover", chordMouseover)
        .on("mouseout", hideTooltip);

      chords.transition().duration(2000)
        .attrTween("d", matrix.chordTween(path));

      chords.exit().remove()

      function groupClick(d) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        $scope.addFilter(d._id);
        resetChords();
      }

      function chordMouseover(d) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        dimChords(d);
        d3.select("#tooltip").style("opacity", 1);
        $scope.updateTooltip(matrix.read(d));
      }

      function hideTooltip() {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        d3.select("#tooltip").style("opacity", 0);
        resetChords();
      }

      function resetChords() {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        container.selectAll("path.chord").style("opacity",0.9);
      }

      function dimChords(d) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        container.selectAll("path.chord").style("opacity", function (p) {
          if (d.source) { // COMPARE CHORD IDS
            return (p._id === d._id) ? 0.9: 0.1;
          } else { // COMPARE GROUP IDS
            return (p.source._id === d._id || p.target._id === d._id) ? 0.9: 0.1;
          }
        });
      }
    }; // END DRAWCHORDS FUNCTION

    function resize() {
      var width = $el.parent()[0].clientWidth;
      svg.attr({
        width: width,
        height: width / (size[0] / size[1])
      });
    }

    resize();
      
    $window.addEventListener("resize", function () {
      resize();
    });
  }; // END LINK FUNCTION

  return {
    link: link,
    restrict: 'EA'
  };

}]);



