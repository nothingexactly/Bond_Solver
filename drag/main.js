// still some debugging to do
       var dataset = [];
       var outs = {};

       outs.price = document.getElementById("price");
       outs.coupon = document.getElementById("coupon");
       outs.term = document.getElementById("term");
       
       outs.price.innerHTML = "I am the price";
       outs.coupon.innerHTML = "I am coupon rate";
       outs.term.innerHTML = "I am term to maturity";

       var dur = new Duration(110,  // price
                              5,    // coupon value
                              10,   // term to maturity
                              100); // par_value

       var durations = []; 
       var colours = [];
       var no_bonds = 7;

       for (var i = 0 ; i < no_bonds; i++) {
                      // term to maturity, coupon, price
         dataset.push([1+Math.random()*9,0.02,85+30*Math.random()]);
         durations.push(0);
         colours.push(d3.hsl(350*i/no_bonds,0.5,0.5));
       }
       
       // draw space parameters 
       var h = 400;
       var w = 600; 
       var pad = 70;

       // SVG parameters
       var arcStroke = 10;
       var gap = 15;
       
       var arcFill = "#ff9933";
       var errorFill = "red"; 
       var pointFill = "grey";

       // Bar chart parameters
       var bc_width = w;
       var bc_height = 100;
       var bar_width = 0.9*bc_height/(dataset.length+1);
       
       // Scales

       var x_scale = d3.scaleLinear().domain([0,10])       // Time until maturity (years)
                                     .range([pad,w-pad]); 
        
       var y_scale = d3.scaleLinear().domain([0,0.2])      // Coupon rate 
                                     .range([h-pad,pad]); 

       var arc_scale = d3.scaleLinear().domain([85,115])   // Price 
                                       .range([20,50]);          

       var bar_scale = d3.scaleLinear().domain([0,10])     // Modified Duration (%)
                                       .range([0,bc_width]); 

       // Chart and data
       var bg = d3.rgb(219,247,255);
           bg = "white"; 

       var svg = d3.select("#ui").append("svg")
                                 .attr("id", "chart")
                                 .attr("width",w)
                                 .attr("height",h)
                                 .style("background-color",bg);

           svg.append("line").attr("id","touchY");
           svg.append("line").attr("id","touchX");
           
           svg.selectAll("line").style("stroke","black").attr("class","axis_readoff");

       var sensitivities = d3.select("#mod_dur").append("svg")
                                            .attr("id","chart")
                                            .attr("width",w)
                                            .attr("height",100)     
                                            .style("background-color",/* "#ffe6ff" */ "white");

           sensitivities.selectAll(".bar")
                  .data(durations)
                .enter().append("rect")
                  .attr("class", "bar")
                  .style("fill",(d,i) => colours[i])
                  .attr("x",(d,i) => { return -0.5*(bar_width+bc_height) + (i+1)*100/(durations.length+1); })
                  .attr("y","0")
                  .attr("width",bar_width)
                  .attr("height",d => bar_scale(d))
                  .attr("transform","translate("+0+","+(bc_height/2)+")rotate(-90)");
/* 
       var bc_width = w;
       var bc_height = 100;
       var bar_width = 10;
*/ 
  /*
   *   Functions to be called on user input
   *
   */
       
       // set the cross-hairs when a point is dragged
       
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
      
       // update parameters of the duration object on user input

       function recalculate(price,par,coupon_rate,time,bondId) {
            if (coupon_rate*par*time+par < price) {
                console.log("Increase coupon or term to maturity, or decrease price"); 
                return false;
            } else {
                dur.pv = price;
                dur.m = par;
                dur.c = coupon_rate*par;
                dur.n = time;
                
                dur.newtonSolve(10);
                dur.macaulayDuration();
                var id = parseInt(bondId.substr(2));

                durations[id] = dur.modifiedDuration(); 
                console.log("price "+price);
                console.log("duration "+durations[id]); 

                sensitivities.selectAll("rect")
                  .data(durations)
                  .attr("height",d => bar_scale(d))
                  .attr("transform","translate("+pad+","+(bc_height/2)+")rotate(-90)");

                return true;
           } 
       }

       // drag behaviour for the points 

       var dragInner = d3.drag()
                .on("drag", function(d,i) {
                    var unitX = x_scale(1) - x_scale(0);
                    var unitY = -(h-2*pad)/0.2; 

                    // map pixel displacement to domain
                    // and update bound data

                    d[0] += d3.event.dx / unitX; 
                    d[1] += d3.event.dy / unitY; 

                    if (d[0] > 10) d[0] = 10;
                    if (d[0] < 0) d[0] = 0;

                    if (d[1] > 0.2) d[1] = 0.2;
                    if (d[1] < 0) d[1] = 0; 
                    
                    outs.term.innerHTML = d[0];
                    outs.coupon.innerHTML = d[1]; 

                    // recalculate pixel position based on datum 
                    var px = x_scale(d[0]); 
                    var py = y_scale(d[1]);
                    
                    // and update the position attributes
                    var currentPoint = d3.select(this)
                                         .attr("cx",px)
                                         .attr("cy",py);

                    setLines(px,py); // update the cross-hairs
                    
                    // find the corresponding arc for this point to 
                    //     i)  drag it in correspondence with the point 
                    //     ii) get the final piece of data required for 
                    //         update of the duration object    

                    var arcId = "#a"+d3.select(this).attr("id").substring(1,2);
                    
                    // reposition
                    var linkedArc = svg.select(arcId).attr("transform","translate(" + px  + "," + py + ")");
                    
       
                    // update duration object
                    // check if parameters are valid
                    // function recalculate(price,par,coupon_rate,time,bondId) {
                    
                    if (!recalculate(linkedArc.datum()[2],100,d[1],d[0],arcId)) {
                       currentPoint.attr("fill",errorFill); 
                       linkedArc.style("fill",errorFill);
                    } else {
                       currentPoint.attr("fill",pointFill); 
                       linkedArc.style("fill",colours[i]);
                    }

                }); 
          
          // Drag behaviour for the arcs

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

                    if (d[2] > 115) d[2] = 115;
                    if (d[2] < 85) d[2] = 85; 
                    
                    outs.price.innerHTML = d[2];

                    var arc = d3.arc()
                                .innerRadius(arc_scale(d[2]))              // wonder if this will evaluate correctly
                                .outerRadius(arc_scale(d[2])+arcStroke)
                                .startAngle(-0.5)
                                .endAngle(1.7);

                       thisArc.attr("d",arc);
                    
                    var linkedPoint = svg.select(circId);

                    if (!recalculate(d[2],100,linkedPoint.datum()[1],linkedPoint.datum()[0],circId)) {
                       linkedPoint.attr("fill",errorFill); 
                       thisArc.style("fill",errorFill);
                    } else {
                       linkedPoint.attr("fill",pointFill); 
                       thisArc.style("fill",colours[i]);
                    }
         });

  /*
   *   Initialization and binding of data to SVGs 
   *
   */

       // Points
       
       var innerCircles = svg.selectAll("circle").data(dataset)
                                  .enter()
                                  .append("circle")
                                  .attr("id",(d,i) => "c"+i)
                                  .attr("fill","grey")
                                  .attr("cx",d => x_scale(d[0]))
                                  .attr("cy",d => y_scale(d[1]))
                                  .attr("r",5)                  
                                  .call(dragInner);
                                 
        // Arcs

        function outerCircles() {
              var arc = d3.arc()
                          .startAngle(-0.5)
                          .endAngle(1.7);
             
                  svg.selectAll("path").data(dataset).enter().append("path")
                           .style("fill",(d,i) => colours[i])
                           .attr("id",(d,i) => "a"+i)
                           .attr("d", arc.innerRadius((d,i) => arc_scale(d[2])).outerRadius((d,i) => arc_scale(d[2])+arcStroke))
                           .attr("transform",(d,i) => { return "translate(" + x_scale(d[0])  + "," + y_scale(d[1]) + ")"; } )
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
        
        // could use tickFormat() 
        
        // this is version 4 syntax

        var xAxis = d3.axisBottom(x_scale).ticks(5);
        var yAxis = d3.axisLeft(y_scale).ticks(5);
        var ss = d3.scaleOrdinal().domain(dataset.map((d,i) => i+1))       // Time until maturity (years)
                                  .range(dataset.map((d,i) => (i+1)*bc_height/(dataset.length+1)));

        var barAxis = d3.axisLeft(ss); 

            svg.append("g")
               .attr("class","xaxis axis")                     // to help with styling 
               .attr("transform","translate(0,"+(h - pad)+")") // trans to bottom
               .call(xAxis);                                   // passes this group 'g' as param to xAxis

            svg.append("g")
               .attr("class","yaxis axis")                     // to help with styling 
               .attr("transform","translate("+pad+",0)")       // shift to right 
               .call(yAxis);

            svg.selectAll(".xaxis text")                       // select all the text elements for the xaxis
               .attr("transform", function(d) {
               return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
            });


            sensitivities.append("g")
                         .attr("class","yaxis axis")
                         .attr("transform","translate("+pad+",0)")
                         .call(barAxis);


/*
        var yBar = d3.scale.ordinal()
                         .rangeRoundBands([pad, pad+bc_width], .1);

        var yAxisBar = d3.svg.axis()
                         .scale(yBar)
                         .orient("left");


            svg.append("g")
              .attr("class", "y axis")
              .attr("transform", "rotate(-90)")
              .call(yAxisBar);
*/        

         // Axis Titles 

            svg.append("text")
                .attr("text-anchor", "middle")  // easy to centre text as transform applied to anchor
                .attr("transform", "translate("+ (pad/3) +","+(h/2)+")rotate(-90)")  
                .attr("class","axis")
                .text("Coupon Rate");

            svg.append("text")
                .attr("text-anchor", "middle")  
                .attr("transform", "translate("+ (w/2) +","+(h-(pad/3))+")")  // centre below axis
                .attr("class","axis")
                .text("Time to Maturity");
