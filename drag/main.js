       var bonds = []; // just for initializing the bonds
       var outs = {};
       
       // HTML Output- mainly for debugging
       outs.price = document.getElementById("price");
       outs.coupon = document.getElementById("coupon");
       outs.term = document.getElementById("term");
       outs.duration = document.getElementById("duration");
       
       outs.price.innerHTML = "I am the price";
       outs.coupon.innerHTML = "I am coupon rate";
       outs.term.innerHTML = "I am term to maturity";
       outs.duration.innerHTML = "Modified Duration";
       
       // A single new duration object that will be
       // used to calculate the modified duration for
       // all of the bonds.
       var dur = new Duration(110,  // price
                              5,    // coupon value
                              10,   // term to maturity
                              100); // par_value

       var durations = [];  // the durations are treated as separate from the bonds 
                            // This is because the bonds array is just for initialization
                            // Thereafter, each bond's data is split between an svg arc
                            // and an svg circle
                            
       var colours = [];
       var no_bonds = 7;    // number of bonds
       
       // Initialize the Bonds
       for (var i = 0 ; i < no_bonds; i++) {
         bonds.push({term: 1+Math.random()*9, coupon: (i+1)*0.9*0.2/no_bonds, price: 85+30*Math.random()});
         durations.push(5);
         colours.push(d3.hsl(350*i/no_bonds,0.5,0.5));
       }

       // Initialize Durations
       for (var i = 0 ; i < bonds.length ; i++) {
            recalculate(bonds[i].price,100,bonds[i].coupon,bonds[i].term,"#b"+i);
       }
       
       function updateBars() {
           sensitivities.selectAll(".bar")
                  .data(durations)
                  .attr("width",(d,i) => { return bar_scale(d) })
                  .attr("height",bar_width);
       }

       // UI Canvas parameters 
       var h = 400;
       var w = 600; 
       var pad = 70;

       // Draggable Shape parameters 
       var arcStroke = 10;
       var gap = 15;
      
       var arcFill = "#ff9933";
       var errorFill = "red"; 
       var pointFill = "grey";

       // Duration Horizontal Bar Chart parameters
       var bc_width = w;
       var bc_height = 150;
       var bc_vert_gap = 50;
       var bar_width = (bc_height-bc_vert_gap)/bonds.length;
       
       // Scales

       var x_scale = d3.scaleLinear().domain([0,10])       // Remaining Time to maturity (years)
                                     .range([pad,w-pad]); 
        
       var y_scale = d3.scaleLinear().domain([0,0.2])      // Coupon rate 
                                     .range([h-pad,pad]); 

       var arc_scale = d3.scaleLinear().domain([85,115])   // Price 
                                       .range([20,50]);          

       var bar_scale = d3.scaleLinear().domain([0,10])     // Modified Duration (%)
                                       .range([0,bc_width-2*pad]); 

       // Charts
       var bg = d3.rgb(219,247,255);
           bg = "white"; 

       var svg = d3.select("#ui").append("svg")
                                 .attr("id", "chart")
                                 .attr("width",w)
                                 .attr("height",h)
                                 .style("background-color",bg);
           
       // Durations Bar Chart
       var sensitivities = d3.select("#mod_dur").append("svg")
                                            .attr("id","chart")
                                            .attr("width",w)
                                            .attr("height",bc_height)     
                                            .style("background-color",/* "#ffe6ff" */ "white");
                 
       // Initialize Duration Bars
          sensitivities.selectAll(".bar")
                  .data(durations)
                .enter().append("rect")
                  .attr("class", "bar")
                  .style("fill",(d,i) => colours[i])
                  .attr("x","0")
                  .attr("y",(d,i) => { return i*bar_width; })
                  .attr("transform","translate("+pad+","+0+")rotate(0)");
       
       var Annotator = function(message,colour,x,y) {
            return function(selection) {
                        var words = message.split('/');   // convention used in this program
                        selection.text('');
                        
                        selection.attr("y",y);
                        selection.style("fill",colour);

                        for (var i = 0; i < words.length; i++) {
                            var tspan = selection.append('tspan').text(words[i]);
                                tspan.attr('dy', '15').attr('x',x);
                        }
                   };
       }

       // Functions triggered by user interaction 
       
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
                dur.n = Math.round(time); // must be discrete number of years
                
                dur.newtonSolve(10);
                dur.macaulayDuration();

                var id = parseInt(bondId.substr(2));

                durations[id] = dur.modifiedDuration(); // this is a side effect
                outs.duration.innerHTML = "Duration "+durations[id].toFixed(2)+"%";
                    return true;
           } 
       }

       /* 
        * Drag Behaviours
        */ 
       
       // utility functions

       function constrain(x,lower,upper) {
            if (x > upper) {
                return upper;
            } else if (x < lower) {
                return lower;
            } else {
                return x;
            }
       }

       var set_colours = function() { svg.selectAll("path").data(bonds).style("fill",(d,i) => colours[i]); };
       var fade_colours = function() {
                            var arcId = parseInt(d3.select(this).attr("id").substring(1,2));
                            svg.selectAll("path").data(bonds).style("fill",(d,i) => i != arcId ? "grey" : colours[i] );
                          }
       
       // dragging

       var dragInner = d3.drag()
                .on("start",fade_colours)
                .on("drag", function(d,i) {
                    var unitX = x_scale(1) - x_scale(0);
                    var unitY = -(h-2*pad)/0.2; 
                    // map pixel displacement to domain
                    // and update bound data 
                    // (this isn't using D3's paradigm effectively)

                    d.term += d3.event.dx / unitX; 
                    d.coupon += d3.event.dy / unitY; 
        
                    // constrain to draw space
                    d.term = constrain(d.term,0,10);
                    d.coupon = constrain(d.coupon,0,0.2);

                    outs.term.innerHTML = "Years: "+d.term.toFixed(2);
                    outs.coupon.innerHTML = "Coupon: "+d.coupon.toFixed(3); 

                    // recalculate pixel position based on datum 
                    var px = x_scale(d.term); 
                    var py = y_scale(d.coupon);
                   
                    
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
                    
                    var price = linkedArc.datum().price;
                    
                    // check if parameters are valid
                    
                    // if valid, annotate with: 
                    var s = "Price: $"+Math.round(d.price)+"/";
                        s += "Coupon: "+Math.round(d.coupon*100)+"%/";
                        s += "Term: "+Math.round(d.term)+" years/";
                        s += "Par: $"+100;
                    var clr = "black"; 

                    if (!recalculate(price,100,d.coupon,Math.round(d.term),arcId)) {
                       currentPoint.attr("fill",errorFill); 
                       linkedArc.style("fill",errorFill);
                       clr = errorFill;
                       s = "Impossible/Parameters";
                    } else {
                       currentPoint.attr("fill",pointFill); 
                       linkedArc.style("fill",colours[i]);
                       updateBars();
                    }

                    annotation.call(Annotator(s,clr,px+10,py+10));
                }).on("end",set_colours); 
          
          // Drag behaviour for the arcs
          // The radius determines the Price of the Bond
          var dragOuter = d3.drag()
                .on("start",fade_colours)
                .on("drag",function(d,i) {
                    // may need some logic here to map r to the correct range 
                    var rx = d3.event.dx;
                    var ry = d3.event.dy;
                    var sign = Math.abs(ry) / ry; 
                    
                    var delta_r = -sign * Math.sqrt(rx*rx+ry*ry); 
                        delta_r = isNaN(delta_r) ? 0 : delta_r; 

                    var thisArc = d3.select(this);
                        
                    // find the corresponding circle for this arc to 
                    // get the data required to update the duration 

                    var circId = "#c"+thisArc.attr("id").substring(1,2);

                    var unit = arc_scale(1)-arc_scale(0); // one unit in the domain corresponds to this in the range 

                    d.price += delta_r/unit; // Nb. this modifies the datum of the arc path 

                    d.price = constrain(d.price,85,115)

                    outs.price.innerHTML = "Price "+d.price.toFixed(2);

                    var arc = d3.arc()
                                .innerRadius(arc_scale(d.price))              
                                .outerRadius(arc_scale(d.price)+arcStroke)
                                .startAngle(-0.5)
                                .endAngle(1.7);

                       thisArc.attr("d",arc);
                    
                    var linkedPoint = svg.select(circId);
                    
                    // retrieve the x,y centre of the arc by parsing the transform attribute
                    var centreX = parseInt(thisArc.attr("transform").substring(10,17));
                    var centreY = parseInt(thisArc.attr("transform").split(",")[1].substr(0,4)); 
                        
                    // check if parameters are valid
                    
                    // if valid, annotate with: 
                    var s = "Price: $"+Math.round(d.price)+"/";
                        s += "Coupon: "+Math.round(d.coupon*100)+"%/";
                        s += "Term: "+Math.round(d.term)+" years/";
                        s += "Par: $"+100;
                    var clr = "black"; 

                    if (!recalculate(d.price,100,linkedPoint.datum().coupon,linkedPoint.datum().term,circId)) {
                       linkedPoint.attr("fill",errorFill); 
                       thisArc.style("fill",errorFill);
                       s = "Impossible/Parameters";
                       clr = errorFill;
                    } else {
                       linkedPoint.attr("fill",pointFill); 
                       thisArc.style("fill",colours[i]);
                       updateBars();
                    }
                    
                    annotation.call(Annotator(s,clr,centreX+10,centreY+10));
                }).on("end",set_colours);

      
  /*
   *   Initialization and binding of data to SVGs 
   *
   */

       // Points
       
       var innerCircles = svg.selectAll("circle").data(bonds)
                                  .enter()
                                  .append("circle")
                                  .attr("id",(d,i) => "c"+i)
                                  .attr("fill","grey")
                                  .attr("cx",d => x_scale(d.term))
                                  .attr("cy",d => y_scale(d.coupon))
                                  .attr("r",5)                  
                                  .call(dragInner);
                                 
        // Arcs

        var outerCircles = (function() {
              var arc = d3.arc()
                          .startAngle(-0.5)
                          .endAngle(1.7);
             
                  svg.selectAll("path").data(bonds).enter().append("path")
                           .style("fill",(d,i) => colours[i])
                           .attr("id",(d,i) => "a"+i)
                           .attr("d", arc.innerRadius((d,i) => arc_scale(d.price)).outerRadius((d,i) => arc_scale(d.price)+arcStroke))
                           .attr("transform",(d,i) => { return "translate(" + x_scale(d.term)  + "," + y_scale(d.coupon) + ")"; } )
                           .call(dragOuter);
        })();

        // Cross hairs (helpful for reading values off axes)
        svg.append("line").attr("id","touchY");
        svg.append("line").attr("id","touchX");
           
        svg.selectAll("line").style("stroke","black").attr("class","axis_readoff");
 
        // define annotation here to put
        // it on top of point / arc SVGs
        var annotation = svg.append("text").text("")
                         .attr("id","note")
                         .attr("x","100")
                         .attr("y","100")
                         .attr("font-family", "sans-serif")
                         .attr("font-size", "11px")
                         .attr("fill", "steelblue")
                         .attr("fill-opacity",1);
           
       
       // Modified Durations
       
       updateBars();       

  /*
   *  Axes 
   *
   */

        // could use tickFormat() 
        
        // this is version 4 syntax

        var xAxis = d3.axisBottom(x_scale).ticks(10);
        var yAxis = d3.axisLeft(y_scale).ticks(5);
        var barLabels = d3.scaleOrdinal().domain(bonds.map((d,i) => i+1))       
                                  .range(bonds.map((d,i) => i*bar_width+bar_width/2));

        var barAxis = d3.axisLeft(barLabels); 

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

        var sensAxis = d3.axisBottom(bar_scale).ticks(5);
            
            sensitivities.append("g")
                         .attr("class","saxis axis")
                         .attr("transform","translate("+pad+","+bar_width*bonds.length+")")
                         .call(sensAxis);

            sensitivities.append("text")
                .attr("text-anchor", "middle")  // easy to centre text as transform applied to anchor
                .attr("transform", "translate("+ (bc_width/2) +","+(140)+")rotate(0)")  
                .attr("class","axis")
                .text("Modified Duration (%)");

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
