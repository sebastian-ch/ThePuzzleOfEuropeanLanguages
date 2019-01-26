var width = parseInt(d3.select('#container').style('width')),
    height = 700;

var svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//var files = ["geojsons/europeWrussia.geojson", "geojsons/mapBubbles.geojson", "geojsons/bubbleChart.geojson"];
var files = ["geojsons/europeWrussia.geojson", "geojsons/movingBubbles26-1.geojson", "geojsons/bubbleChart.geojson"];
var promises = [];

files.forEach(function (url) {
    promises.push(d3.json(url))
});

Promise.all(promises).then(function (values) {
    makeMap(values[0], values[1], values[2])
});

var projection = d3.geoMercator();
var geoPath = d3.geoPath().projection(projection);

var radius = d3.scaleLog(); //function to scale the bubble chart circles


function makeMap(europe, languages, newCoords) {

    //add map to right side of the page
    projection.fitSize([width + 660, height], europe);
    svg.append("g")
        .selectAll("path")
        .data(europe.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        //.attr("stroke", "whitesmoke")
        .attr("fill", "black")
        .attr("class", "europe");

    addBubbles(languages, newCoords)
}

function addBubbles(languages, newCoords) {
    //console.log(languages)
     for (var b in languages.features) {
        languages.features[b].properties.coords = [languages.features[b].properties.x, languages.features[b].properties.y]
        languages.features[b].properties.bubbley = languages.features[b].properties.bubbley - 100;
     }

     //console.log(languages.features)
    /*var bubbleChartCircles = svg.selectAll("circle")
        .data(newCoords.features, function (d) {
            return d;
        }).enter().append("circle")

        .attr('r', function (d) {
            return radius(d.properties.speakers) * 2
        })
        .attr('cx', function (d) {
            return d.geometry.coordinates[0] //don't project bubble chart circles
        })
        .attr('cy', function (d) {
            return d.geometry.coordinates[1] //don't project bubble chart circles
        })
        .attr('stroke', function (d) {
            return d.properties.color
        })
        .attr('fill', '#323232ff')
        .attr("class", "languages2")
        .attr("id", function (d) {
            return d.properties.ID
        })
        .on("mouseover", function () {
            tooltip.style("display", null);
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        })
        .on("mousemove", function (d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d.properties.label);
        })

        .call(d3.drag()
            .on("start", dragStart)
            .on("drag", dragged)
            .on("end", leftDragEnd)); */

    var mapBubbles = svg.selectAll("circle")
        .data(languages.features, function (d) {
            return d;
        })
        .enter().append("circle")
        .attr('r', function (d) {
            return radius(d.properties.speakers) * 2
        })
        .attr('cx', function (d) {
            return projection(d.geometry.coordinates)[0]
        })
        .attr('cy', function (d) {
            return projection(d.geometry.coordinates)[1]
        })
        .attr('fill', 'black')
        .attr('fillOpacity', 0)
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr("class", "map")
        .attr("id", function (d) {
            return "map-" + d.properties.wals_code
        })
        .call(d3.drag()
            .on("start", dragStart)
            .on("drag", dragged)
            .on("end", dragEnd));

    function dragStart(d) {
        d3.event.sourceEvent.stopPropagation();
        tooltip.style("display", "none");
        //console.log(d.properties.Name)
        var x = d3.select(this).attr("cx");
        var y = d3.select(this).attr("cy");

        //console.log("start: " + x + " " + y);
        d3.select(this).classed("active", true)
    }

    function dragged(d) {
        tooltip.style("display", "none");
        d3.select(this)
            .attr("cx", d3.event.x)
            .attr("cy", d3.event.y);
    }

    function dragEnd(d) {
        d3.select(this)
            .classed("active", false)
            .transition()
            .duration(1500)
            .attr('cx', function (d) {
                return projection(d.geometry.coordinates)[0]
            })
            .attr('cy', function (d) {
                return projection(d.geometry.coordinates)[1]
            })
        //console.log(d)       
    }

    function leftDragEnd(d) {

        /*  d3.selectAll(".map").each(function(d) {
              console.log(d.properties.wals_code)
          }) */

        d3.select('#map-' + d.properties.ID)
            .attr('stroke', "yellow")

        console.log(this.attributes.cx.value)
        //console.log(d3.select('#map-' + d.properties.ID).attr('id'));
        console.log('----')
        console.log(d3.select('#map-' + d.properties.ID).attr('cx'));
        //console.log('----')


        var bubbleMovedX = this.attributes.cx.value;
        var bubbleMovedY = this.attributes.cy.value;

        var mapBubbleX = d3.select('#map-' + d.properties.ID).attr('cx');
        var mapBubbleY = d3.select('#map-' + d.properties.ID).attr('cy');

        //if( Math.abs(bubbleMovedX - mapBubbleX) < 30 && Math.abs(bubbleMovedY - mapBubbleY) < 30 ) {
        if (Math.sqrt(Math.pow(Math.abs(bubbleMovedX - mapBubbleX), 2) + Math.pow(Math.abs(bubbleMovedY - mapBubbleY), 2)) < 50) {

            d3.select(this)
                .classed("active", false)
                .transition()
                .duration(500)
                .attr('cx', function (d) {
                    return mapBubbleX
                })
                .attr('cy', function (d) {
                    return mapBubbleY
                })


        } else {
            d3.select(this)
                .classed("active", false)
                .transition()
                .duration(1500)
                .attr('cx', function (d) {
                    return d.geometry.coordinates[0]
                })
                .attr('cy', function (d) {
                    return d.geometry.coordinates[1]
                })
        }
    }

    var tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 150)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.5);

    tooltip.append("text")
        .attr("x", 1)
        .attr("dy", "1.0em")
        .style("text-align", "center")
        .attr("font-size", "15px")
        .attr("font-weight", "bold");

}

function updateData() {

    d3.select('.map').each(function(d){
        
    })

    if (d3.select('.map').classed('leftside')) {
        
        d3.selectAll('.map')
            .classed('leftside', false)
            .transition()
            .duration(1500)
            .attr('cx', function (d) {
                return projection(d.properties.coords)[0];
                
            })
            .attr('cy', function (d) {
                return projection(d.properties.coords)[1];
            })
            .attr('stroke', 'red')
    } else {

        d3.selectAll('.map')
            .classed('leftside', true)
            .transition()
            .duration(1500)
            .attr('cx', function (d) {
                return d.properties.bubblex
            })
            .attr('cy', function (d) {
                return d.properties.bubbley
            })
            .attr('stroke', function (d) {
                return d.properties.color
            })
    }
}