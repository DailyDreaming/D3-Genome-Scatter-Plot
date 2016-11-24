/* ----------------------------------------------------------------------------
File: scatterplot.js
Contructs a scatterplot using D3 from a given .csv file.
Assignment 5 - UCSC CMPS165: Fall 2016
Student: Lon Blauvelt
Collaborator: Conner Powell
-----------------------------------------------------------------------------*/

var margin = {top: 50, right: 200, bottom: 50, left: 80},
    outerWidth = 1200,
    outerHeight = 700,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale
          .linear()
          .range([0, width]);

var y = d3.scale
          .linear()
          .range([height, 0]);

var xCat = "Chromosomes",
    yCat = "Proteins",
    rCat = "Nucleotides",
    colorCat = "Species";

d3.csv("scatterData.csv", function(data) {
  data.forEach(function(d) {
        d.Species = d.Species;
        d.Chromosomes = +d.Chromosomes;
        d.Nucleotides = +d.Nucleotides;
        d.Proteins = +d.Proteins;
        return d;
    });

  var xMax = d3.max(data, function(d) { return d[xCat] + 2; }) * 1.05,
      xMin = d3.min(data, function(d) { return d[xCat] - 2; }),
      xMin = xMin > 0 ? 0 : xMin,
      yMax = d3.max(data, function(d) { return d[yCat] + 1400; }) * 1.05,
      yMin = d3.min(data, function(d) { return d[yCat] - 2000; }),
      yMin = yMin > 0 ? 0 : yMin;

  x.domain([xMin, xMax]);
  y.domain([yMin, yMax]);

  var xAxis = d3.svg
                .axis()
                .scale(x)
                .orient("bottom")
                .tickSize(-height);

  var yAxis = d3.svg
                .axis()
                .scale(y)
                .orient("left")
                .tickSize(-width);

  var color = d3.scale.category20();

  var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function(d) {
        return xCat + ": " + d[xCat] + "<br>"
              + yCat + ": " + d[yCat] + "<br>"
               + rCat + ": " + d[rCat] + "<br>"
                + colorCat + ": " + d[colorCat] + "<br>";
      });

  var zoomBeh = d3.behavior
      .zoom()
      .x(x)
      .y(y)
      .scaleExtent([0, 500])
      .on("zoom", zoom);

  var svg = d3.select("#scatter")
              .append("svg")
              .attr("width", outerWidth)
              .attr("height", outerHeight)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
              .call(zoomBeh);

  svg.call(tip);

  svg.append("rect")
     .attr("width", width)
     .attr("height", height);

  // X Axis
  svg.append("g")
     .classed("x axis", true)
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis)
     .append("text")
     .classed("label", true)
     .attr("x", width/2)
     .attr("y", margin.bottom - 10)
     .style("text-anchor", "middle")
     .text("Number of Chromosomes");

  // Y Axis
  svg.append("g")
     .classed("y axis", true)
     .call(yAxis)
     .append("text")
     .classed("label", true)
     .attr("transform", "rotate(-90)")
     .attr("x", -width/4)
     .attr("y", -margin.left)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("Total Proteins Expressed");
    
  var objects = svg.append("svg")
      .classed("objects", true)
      .attr("width", width)
      .attr("height", height);

  objects.append("svg:line")
      .classed("axisLine hAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0)
      .attr("transform", "translate(0," + height + ")");

  objects.append("svg:line")
      .classed("axisLine vAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

  objects.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .classed("dot", true)
      .attr("r", function (d) { return 6 * Math.sqrt(d[rCat] / Math.PI); })
      .attr("transform", transform)
      .style("fill", function(d) { return color(d[colorCat]); })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .classed("legend", true)
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("r", 3.5)
      .attr("cx", width + 20)
      .attr("fill", color);

  legend.append("text")
      .attr("x", width + 26)
      .attr("dy", ".35em")
      .text(function(d) { return d; });

  d3.select("input").on("click", change);

  function change() {
    xCat = "coords";
    xMax = d3.max(data, function(d) { return d[xCat]; });
    xMin = d3.min(data, function(d) { return d[xCat]; });

    zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

    var svg = d3.select("#scatter").transition();

    svg.select(".x.axis")
        .duration(750)
        .call(xAxis)
        .select(".label")
        .text(xCat);

    objects.selectAll(".dot")
        .transition()
        .duration(1000)
        .attr("transform", transform);
  }

  function zoom() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll(".dot")
        .attr("transform", transform);
  }

  function transform(d) {
    return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
  }
});