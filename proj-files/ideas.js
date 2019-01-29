function addLangFams(langfams) {

    console.log(langfams)

    svg.append("g")
        .selectAll("path")
        .data(langfams.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        //.attr("stroke", "red")
        /*.attr("fill", function(d){
            if (d.properties.LANG_FAMILY == 'Uralic'){
                return '#f900baff'
            } else if(d.properties.LANG_FAMILY == 'Languages of the Caucasus') {
                return '#e4bd00ff'
            } else if(d.properties.LANG_FAMILY == 'Altaic') {
                return '#47edb6ff'
            } else if(d.properties.LANG_FAMILY == 'Basque') {
                return '#fa0000ff'
            } else if(d.properties.LANG_FAMILY == 'Indo-European') {
                return 'blue'
            } else {
                return 'black';
            }
        }) */
        .attr("class", "languages")
        .attr('id', function (d) {
            return d.properties.LANG_FAMILY
        });



    d3.selectAll('.name')
        .on('click', function (d) {
            //console.log(this.id)
            if (d3.select('[id=' + this.id + ']').classed('filledIn')) {
                d3.select('[id=' + this.id + ']')
                    .classed('filledIn', false)
                    .transition()
                    .duration(1000)
                    .style('fill', 'black')

            } else {

                d3.select('[id=' + this.id + ']')
                    .classed('filledIn', true)
                    .transition()
                    .duration(1000)
                    .style('fill', 'blue')

            }
        })
}