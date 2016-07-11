// Nb. at the moment, I don't like the non-uniform scaling of this chart
       var dataset = [
                       [5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
                       [410, 12], [475, 44], [25, 67], [85, 21], [220, 88]
                     ];       
       
           dataset = [];
            
           for (var i = 0 ; i < 2; i++) {
                dataset.push([Math.random()*1200,Math.random()*1100]);
           }

       var h = 400;
       var w = 600; 
       var pad = 30;
       var startDrag = false;
       var dragging = true;
       var endDrag = true;
       var delta = [0,0];

       // Scales

       var x_scale = d3.scale.linear().domain([0,d3.max(dataset,d => d[0])])
                                      .range([pad,w-2*pad]);

       var y_scale = d3.scale.linear().domain([0,d3.max(dataset,d => d[1])])
                                      .range([h-pad,pad]); 
/*
       var r_scale = d3.scale.linear().domain([0,d3.max(dataset,d => d[1])])
                                      .range([2,5]);
*/

       // Chart and data
       var bg = d3.rgb(196,228,255);
       var svg = d3.select("body").append("svg")
                                   .attr("width",w)
                                   .attr("height",h)
                                   .style("background-color",bg);

          var drag = d3.behavior.drag()
                .on("drag", function(d,i) {

                var unitX = x_scale(1) - x_scale(0);
                var unitY = y_scale(1) - y_scale(0);
                
                d[0] += d3.event.dx / unitX;
                d[1] += d3.event.dy / unitY;
/*
                    d3.select(this).attr("transform", function(d,i){
                        return "translate(" + [ x_scale(d[0]),y_scale(d[1]) ] + ")";
                    });
*/
                    d3.select(this)
                      .attr("cx",x_scale(d[0]))
                      .attr("cy",y_scale(d[1]));
                }); 

      
           svg.selectAll("circle").data(dataset)
                                  .enter()
                                  .append("circle")
                                  .attr("cx",d => x_scale(d[0]))
                                  .attr("cy",d => y_scale(d[1]))
                                  //.attr("r",d => r_scale(d[1]))
                                  .attr("r",10)
                                  .call(drag);

               svg.selectAll("text").data(dataset)
                                .enter()
                                .append("text")
                                .text(d => Math.round(d[0])+","+Math.round(d[1]))
                                .attr("x",d => x_scale(d[0]))
                                .attr("y",d => y_scale(d[1]))
                                .attr("font-family", "sans-serif")
                                .attr("font-size", "11px")
                                .attr("fill", "steelblue");
        // Axes
        
        // see also the tickFormat(), which is mentioned in the tutorial
        
        // this is version 4 syntax
/*
        var xAxis = d3.axisBottom(x_scale).ticks(5);
        var yAxis = d3.axisLeft(y_scale).ticks(5);

            svg.append("g")
               .attr("class","axis")    // to help with styling 
               .attr("transform","translate(0,"+(h - pad)+")") // trans to bottom
               .call(xAxis);            // passes 'g' as param to xAxis

            svg.append("g")
               .attr("class","axis")    // to help with styling 
               .attr("transform","translate("+pad+",0)") // shift to right 
               .call(yAxis);
*/
