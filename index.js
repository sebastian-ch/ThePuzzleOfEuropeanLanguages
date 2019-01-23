var width = parseInt(d3.select('#container').style('width')),
            height = 800;

        var svg = d3.select("#container")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        var files = ["geojsons/europeWrussia.geojson", "geojsons/languages.geojson", "geojsons/newcoords3019.geojson"];
        var promises = [];


        files.forEach(function (url) {
            promises.push(d3.json(url))
        });


        Promise.all(promises).then(function (values) {
            makeMap(values[0], values[1], values[2])

        });

        var projection = d3.geoMercator();
        var geoPath = d3.geoPath()
            .projection(projection);

        var radius = d3.scaleLog();

        function makeMap(europe, languages, newCoords) {

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

            var newCoordsPlzWork = svg.selectAll("circle")
                .data(newCoords.features, function (d) {
                    return d;
                }).enter().append("circle")
                .attr('r', function (d) {
                    return radius(d.properties.speakers) * 2
                })
                .attr('cx', function (d) {
                    return d.geometry.coordinates[0]
                })
                .attr('cy', function (d) {
                    return d.geometry.coordinates[1]
                })
                .attr('fill', function (d) {
                    return d.properties.color
                })
                .call(d3.drag()
                    .on("start", dragStart)
                    .on("drag", dragged)
                    .on("end", leftDragEnd));

            var bubbles = svg.selectAll("circle")
                .data(languages.features, function (d) {
                    return d;
                })
                .enter().append("circle")
                .attr('r', function (d) {
                    return radius(d.properties.speakers) * 3
                })
                .attr('cx', function (d) {
                    return projection(d.geometry.coordinates)[0]
                })
                .attr('cy', function (d) {
                    return projection(d.geometry.coordinates)[1]
                })
                .attr('fill', 'none')
                .attr('stroke', 'red')
                .attr('stroke-width', 2)
                .attr("class", "languages")
                .attr("id", function (d) {
                    return d.properties.iso_code
                })
                .call(d3.drag()
                    .on("start", dragStart)
                    .on("drag", dragged)
                    .on("end", dragEnd));

            function dragStart(d) {
                console.log(d.properties.Name)
                var x = d3.select(this).attr("cx");
                var y = d3.select(this).attr("cy");

                console.log("start: " + x + " " + y);
                
                d3.select(this).classed("active", true)
            }

            function dragged(d) {
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