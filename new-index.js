var width = parseInt(d3.select('#container').style('width')),
    height = 700;

var svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var files = [
    
    "geojsons/europeWrussia2.geojson",
    "geojsons/bubbleChart.geojson",
    "geojsons/mapBubbles.geojson",
    "geojsons/movingBubbles26-1.geojson",

];

var promises = [];

files.forEach(function (url) {
    promises.push(d3.json(url))
});

Promise.all(promises).then(function (values) {

    addBaseMap(values[0]);
    addBubbleChartBubbles(values[1]);
    addMapBubbles(values[2]);
    addMovingBubbles(values[3]);
    
});

var projection = d3.geoMercator();
var geoPath = d3.geoPath().projection(projection);
var radius = d3.scaleLog(); //function to scale the bubble chart circles

function addBaseMap(basemap) {

    projection.fitSize([width + 660, height], basemap);
    svg.append("g")
        .selectAll("path")
        .data(basemap.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        //.attr("stroke", "whitesmoke")
        .attr("fill", "black")
        .attr("class", "europe");

}

//add bubbleChart bubbles to the left
function addBubbleChartBubbles(bubbleChartBubbles) {
    
    //move all the bubbles up by 100
    for (var b in bubbleChartBubbles.features) {
        bubbleChartBubbles.features[b].geometry.coordinates[1] = bubbleChartBubbles.features[b].geometry.coordinates[1] - 100;
    }

    svg.selectAll("circle")
        .data(bubbleChartBubbles.features, function (d) {
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
        .attr("class", "bubbleChartBubbles")
        .attr("id", function (d) {
            return "bubbleChart-"+ d.properties.ID
        })
       /* .on("mouseover", function () {
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

}

function addMapBubbles(mapBubbles) {

    svg.selectAll("circle")
        .data(mapBubbles.features, function (d) {
            return d;
        }).enter().append("circle")
        .attr('r', function (d) {
            return radius(d.properties.speakers) * 2
        })
        .attr('cx', function (d) {
            return projection(d.geometry.coordinates)[0]
        })
        .attr('cy', function (d) {
            return projection(d.geometry.coordinates)[1]
        })
        .attr('stroke', 'whitesmoke')
        .attr('fill', '#323232ff')
        .attr("class", "mapBubbles")
        .attr("id", function (d) {
            return "mapBubbles-"+ d.properties.ID
        })

}

function addMovingBubbles(movingBubbles) {

    for (var b in movingBubbles.features) {
        movingBubbles.features[b].properties.coords = [movingBubbles.features[b].properties.x, movingBubbles.features[b].properties.y]
        movingBubbles.features[b].properties.bubbley = movingBubbles.features[b].properties.bubbley - 100;
    }

    svg.selectAll("circle")
        .data(movingBubbles.features, function (d) {
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
        .attr("class", "movingBubbles")
        .attr("id", function (d) {
            return "movingBubbles-" + d.properties.wals_code
        })
        .call(d3.drag()
            .on("start", dragStart)
            .on("drag", dragged)
            .on("end", dragEnd));

    /**************** DRAG FUNCTIONS **********************/
    function dragStart(d) {

        d3.event.sourceEvent.stopPropagation();
        tooltip.style("display", "none");
        var x = d3.select(this).attr("cx");
        var y = d3.select(this).attr("cy");

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
    }
}

function updateData() {

  /*  d3.select('.movingBubbles').each(function (d) {
        console.log(d)
    }) */

    if (d3.select('.movingBubbles').classed('leftside')) {

        d3.selectAll('.movingBubbles')
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

        d3.selectAll('.movingBubbles')
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