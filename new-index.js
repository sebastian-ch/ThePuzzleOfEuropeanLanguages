
//gets width of container div and makes that the map width
var width = parseInt(d3.select('#container').style('width')),
    height = 700;

//add svg element to container div
var svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//geojsons we are loading in
var files = [
    "geojsons/europeWrussia2.geojson",
    "geojsons/bubbleChart.geojson",
    "geojsons/mapBubbles29-1.geojson",
    "geojsons/movingBubbles26-1.geojson",
];

//empty array for promise handling
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

//create separate items for each geojson
var basemapG = svg.append("g"),
    bubbleChartG = svg.append("g"),
    mapBubblesG = svg.append("g"),
    movingBubblesG = svg.append("g");

//set projection for map
var projection = d3.geoMercator();
var geoPath = d3.geoPath().projection(projection);
//function to scale the bubble chart circles
var radius = d3.scaleLog();


/************************** ADD EUROPE BASEMAP ON THE RIGHT SIDE **********************/
function addBaseMap(basemap) {
    //project europe and have it fit within the div
    // +660 to push it over to the right side
    projection.fitSize([width + 660, height], basemap);
    basemapG
        .selectAll("path")
        .data(basemap.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .attr("stroke", "black") //stroke color black
        //.attr("stroke-width", 0.2)
        .attr("fill", "black") //fill color black
        .attr("class", "europe"); //set the class of this element to europe

}

/************************** ADD BUBBLES ON THE BUBBLE CHART SIDE **********************/
function addBubbleChartBubbles(bubbleChartBubbles) {

    //move all the bubbles up by 100 to center them more
    for (var b in bubbleChartBubbles.features) {
        bubbleChartBubbles.features[b].geometry.coordinates[1] = bubbleChartBubbles.features[b].geometry.coordinates[1] - 100;
    }

    bubbleChartG.selectAll("circle")
        .data(bubbleChartBubbles.features, function (d) {
            return d;
        }).enter().append("circle")
        .attr('r', function (d) {
            return radius(d.properties.speakers) * 2 //make the radius of the bubbles the log of # of speakers *2
        })
        .attr('cx', function (d) {
            return d.geometry.coordinates[0] //don't project bubble chart circles
        })
        .attr('cy', function (d) {
            return d.geometry.coordinates[1] //don't project bubble chart circles
        })
        .attr('stroke', function (d) {
            return d.properties.color //color each bubble chart bubble
        })
        .attr('fill', '#323232ff') //set fill color same as background to it looks empty
        .attr("class", "bubbleChartBubbles") //set class to bubbleChartBubbles
        .attr("id", function (d) {
            return "bubbleChart-" + d.properties.ID // set id to wals_code
        })


}

/************************** ADD INVISIBLE BUBBLES ON RIGHT SIDE **********************/
function addMapBubbles(mapBubbles) {

    mapBubblesG.selectAll("circle")
        .data(mapBubbles.features.sort(function (a, b) {
            return b.properties.speakers - a.properties.speakers;
        }), function (d) {
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
        //.attr('stroke', 'whitesmoke')
        .attr('fill-opacity', 0)
        //.attr('fill', '#323232ff')
        .attr("class", "mapBubbles")
        .attr("id", function (d) {
            return "mapBubbles-" + d.properties.wals_code
        })

}
/************************** ADD MOVING BUBBLES **********************/
function addMovingBubbles(movingBubbles) {

    var div = d3.select("body").append("div")
        .attr("class", "popup")
        .style("opacity", 0)
        .style("padding", 0);

    d3.select('body').on('click', function (d) {
        div.style("opacity", 0)
            .style("padding", 0)
    })


    for (var b in movingBubbles.features) {

        movingBubbles.features[b].properties.coords = [movingBubbles.features[b].properties.x, movingBubbles.features[b].properties.y]
        movingBubbles.features[b].properties.bubbley = movingBubbles.features[b].properties.bubbley - 100;
    }

    movingBubblesG.selectAll("circle")
        .data(movingBubbles.features.sort(function (a, b) {
            return b.properties.speakers - a.properties.speakers;
        }), function (d) {
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
        .attr('fill', function (d) {
            return d.properties.color
        })
        .attr('opacity', 1)
        .attr("class", function (d) {
            return "movingBubbles " + d.properties.family + " " + d.properties.Genus_CAPS.toLowerCase()
        })
        .style("cursor", "pointer")
        .attr("id", function (d) {
            return "movingBubbles" + d.properties.wals_code_move;
        })
        .on("mouseover", function (d) {
            tooltip.style("display", null);
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        })
        .on("mousemove", function (d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 40;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select('text').html(d.properties.Name)
        })
        .on("click", clicked)
        .call(d3.drag()
            .on("start", dragStart)
            .on("drag", dragged)
            .on("end", dragEnd));

    function nozoom() {
        d3.event.preventDefault();
    }

    function clicked(d) {

        div.style("opacity", .9);

        div.transition()
            .duration(200)
            .style("opacity", .8);

            var languageLink = '<a href="https://wals.info/languoid/lect/wals_code_' + d.properties.wals_code_move + '" target="_blank">' + d.properties.Name + '</a>';
            var familyLink = '<a href="https://wals.info/languoid/family/' + d.properties.family.replace(/\W/g, '').toLowerCase() + '" target="_blank">' + d.properties.family + '</a>';
            var genusLink = '<a href="https://wals.info/languoid/genus/' + d.properties.Genus_CAPS.toLowerCase() + '" target="_blank">' + d.properties.Genus_CAPS + '</a>';

        div.html("<b>Language: </b>" + languageLink + "<br>" +
                "<b>Family: </b>" + familyLink + "<br>" +
                "<b>Genus: </b>" + genusLink + "<br>" +
                "<b>Approx. # of Speakers: </b>" + d.properties.speakers)
            .style("left", (d3.event.pageX + 28) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

    }

    /************************** TOOLTIP FUNCTIONS **********************/
    var tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none")

    tooltip.append("rect")
    //.attr("width", 100)
    //.attr("height", 20)
    //.style("opacity", 0.5);

    tooltip.append("text")
        .attr("x", 1)
        .attr("dy", "1.0em")
        .style("text-align", "center")
        .attr('fill', 'whitesmoke')
        .attr("font-size", "15px")
        .attr("font-weight", "bold");

    /************************** DRAG FUNCTIONS **********************/
    function dragStart(d) {

        d3.event.sourceEvent.stopPropagation();
        tooltip.style("display", "none");
        var x = d3.select(this).attr("cx");
        var y = d3.select(this).attr("cy");

        d3.select(this).classed("active", true).raise()
    }

    function dragged(d) {

        tooltip.style("display", "none");
        d3.select(this)
            .attr("cx", d3.event.x)
            .attr("cy", d3.event.y);
    }

    function dragEnd(d) {


        if (d3.select(this).classed('leftside')) {

            /*d3.select('#mapBubbles-' + d.properties.wals_code_move)
                .attr('stroke', "yellow") */

            var bubbleMovedX = this.attributes.cx.value;
            var bubbleMovedY = this.attributes.cy.value;

            var mapBubbleX = d3.select('#mapBubbles-' + d.properties.wals_code_move).attr('cx');
            console.log(d.properties.wals_code_move)
            var mapBubbleY = d3.select('#mapBubbles-' + d.properties.wals_code_move).attr('cy');

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
                        return d.properties.bubblex
                    })
                    .attr('cy', function (d) {
                        return d.properties.bubbley
                    })
            }


        } else if (!d3.select(this).classed('leftside')) {

            /* d3.select('#bubbleChart-' + d.properties.wals_code_move)
                 .attr('stroke', "yellow") */

            var bubbleMovedX = this.attributes.cx.value;
            var bubbleMovedY = this.attributes.cy.value;

            var bubbleChartX = d3.select('#bubbleChart-' + d.properties.wals_code_move).attr('cx');

            var bubbleChartY = d3.select('#bubbleChart-' + d.properties.wals_code_move).attr('cy');

            if (Math.sqrt(Math.pow(Math.abs(bubbleMovedX - bubbleChartX), 2) + Math.pow(Math.abs(bubbleMovedY - bubbleChartY), 2)) < 50) {

                d3.select(this)
                    .classed("active", false)
                    .transition()
                    .duration(500)
                    .attr('cx', function (d) {
                        return bubbleChartX
                    })
                    .attr('cy', function (d) {
                        return bubbleChartY
                    })
            } else {
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

    }

    d3.selectAll('.name').on('click', function (d) {
        var name = this.id;

        var selection = d3.selectAll('.' + name);
        //console.log(selection.classed('leftside'));

        if (selection.classed('leftside')) {
            d3.select(this).html('&#9665; ' + name.toUpperCase() + ' &#9654;')
            selection
                .classed('leftside', false).raise()
                .transition()
                .duration(1500)
                .attr('cx', function (d) {
                    return projection(d.properties.coords)[0];
                })
                .attr('cy', function (d) {
                    return projection(d.properties.coords)[1];
                })

        } else {
            d3.select(this).html('&#9664; ' + name.toUpperCase() + ' &#9655;')
            selection
                .classed('leftside', true).raise()
                .transition()
                .duration(1500)
                .attr('cx', function (d) {
                    return d.properties.bubblex
                })
                .attr('cy', function (d) {
                    return d.properties.bubbley
                })
        }
    })
}

function toTheLeftToTheLeft() {

    d3.select('.left').html('&#9664;');
    d3.select('.right').html('&#9655;');

    d3.selectAll('.movingBubbles')
        .classed('leftside', true).raise()
        .transition()
        .duration(1500)
        .attr('cx', function (d) {
            return d.properties.bubblex
        })
        .attr('cy', function (d) {
            return d.properties.bubbley
        })
}

function toTheRight() {

    d3.select('.left').html('&#9665;');
    d3.select('.right').html('&#9654;');

    d3.selectAll('.movingBubbles')
        .classed('leftside', false).raise()
        .transition()
        .duration(1500)
        .attr('cx', function (d) {
            return projection(d.properties.coords)[0];
        })
        .attr('cy', function (d) {
            return projection(d.properties.coords)[1];
        })
}