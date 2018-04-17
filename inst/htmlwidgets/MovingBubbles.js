HTMLWidgets.widget({

  name: 'MovingBubbles',

  type: 'output',

  factory: function(el, width, height) {
  
    // TODO: define shared variables for this instance
    
    d3.select(el).append("p")
      .attr("id", "title")
      .style("margin-top", 0)
      .style("margin-bottom",0)
      .text("Demo");
      
    var svg_height = height - 50;
    
    var svg = d3.select(el).append("svg")
      .attr("width", width)
      .attr("height", svg_height)
      .attr("font-family", "sans-serif")
      .attr("font-size", 9)
      .attr("text-anchor", "middle");
      
    var pack = d3.pack().size([width, svg_height]).padding(1.5);
      
    // add button
    d3.select(el).selectAll("button")
      .data(["click here"])
      .enter().append("button")
      .attr("type", "button")
      .attr("id", "bubbles")
      .text(function(d){return d;});
      
    // define instance
    var lastValue;
  
    return {

      renderValue: function(opts) {

        // TODO: code to render the widget, e.g.
        lastValue = opts;
        
        var dataset = HTMLWidgets.dataframeToD3(opts[0]);
        var frames = opts[1];
        var specified_color = opts[2];
        var color_numeric = opts[3];
        
        var interval_time = 1000;
  
        var color = d3.scaleOrdinal(d3.schemeCategory20);
        var heatmapColor;
        if (specified_color && color_numeric) {
          heatmapColor = d3.scaleLinear()
            .domain([d3.min(dataset, function(d) { return d.color; }), d3.max(dataset, function(d) { return d.color; })])
            .range(["#6363FF",  "#FF6364"]);
        }

        function update(data){
                  
          // hierarchy
          var h = d3.hierarchy({children: data})
          .sum(function(d){return d.value;});
        
          // transition
          var t = d3.transition()
                .duration(interval_time - 300)
                .ease(d3.easePolyInOut);
        
          // JOIN
          // join new data with old elements, if any.
          var nodes = svg.selectAll("g")
            .data(pack(h).leaves(), function(d) {return d.data.key;});
          var circles = nodes.selectAll("circle")
            .data(pack(h).leaves(), function(d){return d.data.key;});
          var labels = nodes.selectAll("text").selectAll("tspan")
          .data(pack(h).leaves(), function(d) {return d.data.key;});
        
          // EXIT
          nodes.exit().transition(t).remove();
          circles.exit().transition(t).attr("r", 1e-6).remove();
          labels.exit().transition(t).remove();
        
          // UPDATE old elements as needed.
          nodes.transition(t).attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          
          circles.transition(t).attr("class", "UPDATE")
            //.attr("id", function(d) { return d.key; })
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { 
              if (specified_color) { if (color_numeric) {
                return heatmapColor(d.data.color);
              } else {
                return color(d.data.color);
              }} else {
                return color(d.data.key);
              }
            });
        
          labels.transition(t).text(function(d) { return d.data.key;});
        
          // ENTER 
          // create new elements as needed.
          var updated_nodes = nodes.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          
          updated_nodes.append("circle")
            .attr("class", "ENTER")
            .attr("r", function(d){return d.r;})
            .style("fill", function(d) { 
              if (specified_color) { 
                if (color_numeric) {
                  return heatmapColor(d.data.color);
                } else {
                  return color(d.data.color);
                }
              } else {
                  return color(d.data.key);
              } 
            });
          
          var updated_texts = updated_nodes.append("text");
          updated_texts.append("tspan")
            .text(function(d) { return d.data.key;});
        }
        
        // plot
        update(dataset.filter(function(d) {return d.frame == frames[0]}));
  
        // event listener
        d3.selectAll("button#bubbles")
          .on("click", function() {
            var i = 0;
            var t = d3.interval(function(elapsed) {
              d3.select("p#title").text(frames[i]);
              update(dataset.filter(function(d) {return d.frame == frames[i]}));
              i++;
              if (elapsed > frames.length*interval_time) t.stop();
            }, interval_time);
          });
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size
        svg_height = height - 50;
        
        svg = d3.select(el).select("svg")
          .attr("width", width)
          .attr("height", svg_height);
        
        pack = d3.pack().size([width, svg_height]).padding(1.5);
        
        // render last value if any
        if (lastValue) {
          this.renderValue(lastValue);
        }
    }
  };
}});