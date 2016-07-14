// Is non-uniform scaling of chart a good idea?
       var dataset = [];

           for (var i = 0 ; i < 2; i++) {
                dataset.push([Math.random()*0.05,85+30*Math.random(),5+4*Math.random()]);
           }

       var h = 400;
       var w = 600; 
       var pad = 70;
       var arcStroke = 10;
       var gap = 15;

       // Scales

       var x_scale = d3.scaleLinear().domain([0,0.05])
                                     .range([pad,w-pad]);

       var y_scale = d3.scaleLinear().domain([85,115])
                                     .range([h-pad,pad]); 

/*
       var r_scale = d3.scale.linear().domain([0,d3.max(dataset,d => d[1])])
                                      .range([2,5]);
*/

       // Chart and data
       var bg = d3.rgb(196,228,255);
       var svg = d3.select("body").append("svg")
                                  .attr("id", "chart")
                                  .attr("width",w)
                                  .attr("height",h)
                                  .style("background-color",bg);

           svg.append("line").attr("id","touchY");
           svg.append("line").attr("id","touchX");
           
           svg.selectAll("line").style("stroke","black").attr("class","axis_readoff");

       function setLines(px,py) {
               svg.select("#touchY").attr("x1",pad)
                                    .attr("y1",py)
                                    .attr("x2",px)
                                    .attr("y2",py);

               svg.select("#touchX").attr("x1",px)
                                    .attr("y1",py)
                                    .attr("x2",px)
                                    .attr("y2",h-pad);
       }      

          var dragInner = d3.drag()
                .on("drag", function(d,i) {
                    var unitX = x_scale(1) - x_scale(0);
                    var unitY = y_scale(1) - y_scale(0);
                    
                    d[0] += d3.event.dx / unitX;
                    d[1] += d3.event.dy / unitY;
                    
                    var px = x_scale(d[0]);
                    var py = y_scale(d[1]);

                        d3.select(this)
                          .attr("cx",px)
                          .attr("cy",py);
                        
                        var circId = "#a"+d3.select(this).attr("id").substring(1,2);
                        console.log(circId);
                        setLines(px,py);

                    svg.select(circId).attr("transform","translate(" + px  + "," + py + ")");
                }); 
          
          var dragOuter = d3.drag()
                .on("drag",function(d,i) {
                    
                    // may need some logic here to map r to the correct range 
                    var rx = d3.event.dx;
                    var ry = d3.event.dy;
                    var sign = Math.abs(ry) / ry; 
                    
                    var delta_r = -sign * Math.sqrt(rx*rx+ry*ry); 
                        delta_r = isNaN(delta_r) ? 0 : delta_r; 

                    var thisArc = d3.select(this);
                        
                    var circId = "#a"+thisArc.attr("id").substring(1,2);

                        console.log(circId);

                        console.log(delta_r); 

                    d[2] += delta_r; // is this ok?
                    d[2] += delta_r; // is this ok?

                    var arc = d3.arc()
                                //.innerRadius(d[2])
                                //.outerRadius(d[2]+5)
                                .innerRadius(d[2])              // wonder if this will evaluate correctly
                                .outerRadius(d[2]+arcStroke)
                                .startAngle(-0.5)
                                .endAngle(1.7);

                       console.log("d2 = "+d[2]);
                       thisArc.attr("d",arc);
          });

          var innerCircles = svg.selectAll("circle").data(dataset)
                                  .enter()
                                  .append("circle")
                                  .attr("id",(d,i) => "c"+i)
                                  .attr("fill","black")
                                  .attr("cx",d => x_scale(d[0]))
                                  .attr("cy",d => y_scale(d[1]))
                                  .attr("r",7)                  
                                  .on("mouseover", function () {
                                        d3.select(this).attr("fill","steelblue");
                                  })
                                  .call(dragInner);
                                 
         function outerCircles() {
              var arc = d3.arc()
                          .startAngle(-0.5)
                          .endAngle(1.7);
             
                          svg.selectAll("path").data(dataset).enter().append("path")
                                               .style("fill", "#ff9933")
                                               .attr("id",(d,i) => "a"+i)
                                               //.attr("fill-opacity",1)
                                               .attr("d", arc.innerRadius((d,i) => gap+d[2]).outerRadius((d,i) => d[2]+gap+arcStroke))
                                               .attr("transform",(d,i) => { return "translate(" + x_scale(d[0])  + "," + y_scale(d[1]) + ")"; } )
                                               .on("mouseover", function (d,i) {
                                                        console.log("hovering over arc"); 
                                                        console.log(d);
                                                        // some arbitrary change
                                                        //d3.select(this).attr("d",arc.innerRadius(10));
                                                })
                                                .call(dragOuter);
        }
        
        outerCircles();
/*
              svg.selectAll("text").data(dataset)
                                .enter()
                                .append("text")
                                .text(d => Math.round(d[0])+","+Math.round(d[1]))
                                .attr("x",d => x_scale(d[0]))
                                .attr("y",d => y_scale(d[1]))
                                .attr("font-family", "sans-serif")
                                .attr("font-size", "11px")
                                .attr("fill", "steelblue");
*/
        // Axes
        
        // see also the tickFormat(), which is mentioned in the tutorial
        
        // this is version 4 syntax

        var xAxis = d3.axisBottom(x_scale).ticks(5);
        var yAxis = d3.axisLeft(y_scale).ticks(5);

            svg.append("g")
               .attr("class","xaxis axis")    // to help with styling 
               .attr("transform","translate(0,"+(h - pad)+")") // trans to bottom
               .call(xAxis);            // passes 'g' as param to xAxis

            svg.append("g")
               .attr("class","yaxis axis")    // to help with styling 
               .attr("transform","translate("+pad+",0)") // shift to right 
               .call(yAxis);

            svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
               .attr("transform", function(d) {
               return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
            });
    
            // now add titles to the axes
            svg.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate("+ (pad/3) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .attr("class","axis")
                .text("Par Value");

            svg.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate("+ (w/2) +","+(h-(pad/3))+")")  // centre below axis
                .attr("class","axis")
                .text("Coupon Rate");
