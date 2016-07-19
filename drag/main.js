// Is non-uniform scaling of chart a good idea?
       var dataset = [];
       var outs = {};

       outs.par = document.getElementById("par");
       console.log(outs.par);
      
       outs.coupon = document.getElementById("coupon");
       outs.term = document.getElementById("term");
       
       outs.par.innerHTML = "I am par value";
       outs.coupon.innerHTML = "I am coupon";
       outs.term.innerHTML = "I am term to maturity";

       var dur = new Duration(80,5,10,70);
    
       for (var i = 0 ; i < 2; i++) {
            dataset.push([Math.random()*0.05,85+30*Math.random(),6]);
       }

       var h = 400;
       var w = 600; 
       var pad = 70;
       var arcStroke = 10;
       var gap = 15;
       
       // Scales

       var x_scale = d3.scaleLinear().domain([0,0.05])
                                     .range([pad,w-pad]); // coupon rate

       var y_scale = d3.scaleLinear().domain([85,115])
                                     .range([h-pad,pad]); // par value

       var arc_scale = d3.scaleLinear().domain([3,10])
                                       .range([20,50]);   // term to maturity

       // Chart and data
       var bg = d3.rgb(219,247,255);
       var svg = d3.select("#ui").append("svg")
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
      
       function recalculate(price,par,coupon_rate,time) {
            if (coupon_rate*par*time+par < price) {
                console.log("Increase coupon, par value, or term to maturity"); 
            } else {
                dur.pv = price;
                dur.m = par;
                dur.c = coupon_rate*par;
                dur.n = time;

                dur.newtonSolve(10);
                dur.macaulayDuration();
                dur.modifiedDuration(); 

                console.log("modD "+dur.modD);
            } 
       }


       var dragInner = d3.drag()
                .on("drag", function(d,i) {
                    var unitX = x_scale(1) - x_scale(0);
                    var unitY = y_scale(1) - y_scale(0);
                    
                    // map pixel displacement to domain
                    // and update bound data

                    d[0] += d3.event.dx / unitX; 
                    d[1] += d3.event.dy / unitY; 

                    var cpFormatter = d3.format(",.1%")(d[0]);

                    outs.coupon.innerHTML = d3.format(",.1%")(d[0]);
                    outs.par.innerHTML = Math.round(d[1])+"$"; 

                    // recalculate pixel position based on datum 
                    var px = x_scale(d[0]); 
                    var py = y_scale(d[1]);
                    
                    // and update the position attributes
                        d3.select(this)
                          .attr("cx",px)
                          .attr("cy",py);
                        
                        var arcId = "#a"+d3.select(this).attr("id").substring(1,2);

                        setLines(px,py);

                    var linkedArc = svg.select(arcId).attr("transform","translate(" + px  + "," + py + ")");
                    recalculate(100,d[1],d[0],linkedArc.datum()[2]);
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
                        
                    var circId = "#c"+thisArc.attr("id").substring(1,2);

                    var unit = arc_scale(1)-arc_scale(0); // one unit in the domain corresponds to this in the range 

                    d[2] += delta_r/unit; // Nb. this does actually modify the datum of the path 

                    if (d[2] > 10) d[2] = 10;
                    if (d[2] < 3) d[2] = 3; 
                    
                    outs.term.innerHTML = Math.round(d[2])+" years";

                    var arc = d3.arc()
                                .innerRadius(arc_scale(d[2]))              // wonder if this will evaluate correctly
                                .outerRadius(arc_scale(d[2])+arcStroke)
                                .startAngle(-0.5)
                                .endAngle(1.7);

                       thisArc.attr("d",arc);

                    var linkedPoint = svg.select(circId).datum();
                    recalculate(100,linkedPoint[1],linkedPoint[0],d[2]);
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
                                   .attr("d", arc.innerRadius((d,i) => arc_scale(d[2])).outerRadius((d,i) => arc_scale(d[2])+arcStroke))
                                   .attr("transform",(d,i) => { return "translate(" + x_scale(d[0])  + "," + y_scale(d[1]) + ")"; } )
                                   .on("mouseover", function (d,i) {
                                            //console.log("hovering over arc"); 
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
