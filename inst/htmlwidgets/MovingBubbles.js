HTMLWidgets.widget({

  name: 'MovingBubbles',

  type: 'output',

  factory: function(el, width, height) {

    // // center main div
    // d3.select(el).attr("style", "width: " + width + "px ;height:" + height + "px ;margin: 0 auto;");

    // declare variables
    var main = d3.select(el).append("div").append("p")
      .attr("id", "main")
    var svg = d3.select(el).append("div").append("svg")
      .attr("id", "MovingBubbles")
      .attr("width", width)
      .attr("height", height - 30);
    var area_to_value_ratio;
    var bubble_size;
    var force;
    var starting_dat;
    var height_offset;
    var leaves;
  
    return {

      renderValue: function(opts) {

        // get data from R
        var dat = HTMLWidgets.dataframeToD3(opts[0]);
        var frames = opts[1];
        starting_dat = HTMLWidgets.dataframeToD3(opts[2]);
        bubble_size = opts[3];
        var font_size = opts[4];
        var speed_factor = opts[5];
        var title_size = opts[6];
        height_offset = opts[7];
        var main_title = opts[8];

        // create svg
        d3.select(el).select("svg")
          .attr("height", height - height_offset);

        // calculate leaves
        leaves = get_leaves(starting_dat, width, height, height_offset);
        // starting_dat = HTMLWidgets.dataframeToD3(opts[2]);

        // calculate area_to_value_ratio
        area_to_value_ratio = calculate_area_to_value_ratio(leaves, bubble_size);
        
        // reset to first frame
        leaves = update_leaves(leaves, dat, frames, 0, area_to_value_ratio);
        
        // add main title
        main.attr("class", "title")
          .style("font-size", title_size)
          .style("font-weight", "bold")
          .text(main_title);
        
        // add frame title
        d3.select(el).append("p")
          .attr("id", "frame")
          .attr("class", "title")
          .style("width", width + "px")
          .style("font-size", title_size)
          .text(frames[0]);
        
        // add tooltips
        var tooltip = d3.select(el).append("div")
          .attr("id", "tooltip")
          .attr("class", "hidden");
        tooltip.append("p").attr("id", "key").text("key");
        tooltip.append("p").attr("id", "value").text("value");

        function mouseover(d) {
          tooltip
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", d3.event.pageY + "px");
          tooltip.select("#key").text(d.data.key);
          tooltip.select("#value").text(d.data.value);
          tooltip.classed("hidden", false);
        }

        function mousemove(d) {
          tooltip
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", d3.event.pageY + "px");
          tooltip  
            .select("#value")
            .text(d.data.value);
        }

        // add bubbles
        var circles = svg.selectAll("circle")
          .data(leaves)
          .enter().append("circle")
            .attr("cx", function(d) {return d.x.toFixed(1);})
            .attr("cy", function(d) {return d.y.toFixed(1);})
            .attr("r", function(d) {return d.r.toFixed(1);})
            .attr("id", function(d) {return d.data.key})
            .style("fill", function(d) {return d.data.color})
            .each(function(d){
              // add dynamic r getter
              var n = d3.select(this);
              Object.defineProperty(d, "rt", {get: function(){
                return +n.attr("r");
                }})
              })
            .on("mouseover", function(d) {mouseover(d)})
            .on("mouseout", function() {tooltip.classed("hidden", true);})
            .on("mousemove", function(d) {mousemove(d)});
        
        // add text inside bubbles
        var labels = svg.selectAll("text")
        .data(leaves)
        .enter().append("text")
          .text(function(d) {return d.data.key})
          .attr("x", function(d) {return d.x.toFixed(1)})
          .attr("y", function(d) {return d.y.toFixed(1)})
          .attr("font-size", function(d) {return Math.round(2 * d.r * 0.2 * font_size) + "px" })
          .attr("fill", function(d) {return get_font_color(d.data.color);})
          .attr("class", "label")
          .on("mouseover", function(d) {mouseover(d);})
          .on("mouseout", function() {tooltip.classed("hidden", true);})
          .on("mousemove", function(d) {mousemove(d);});
        
        force = d3.forceSimulation(leaves)
          .force("charge", d3.forceManyBody().strength(adjust_charge_strength(width, height - height_offset, leaves)))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collide", d3.forceCollide().radius(function(d) {return (d.rt + 5)}).strength(0.7).iterations(3))
          .on("tick", function(e) {
            svg.selectAll("circle")
              .attr("cx", function(d) {return d.x.toFixed(1)})
              .attr("cy", function(d) {return d.y.toFixed(1)});
            svg.selectAll("text")
              .attr("x", function(d) {return d.x.toFixed(1)})
              .attr("y", function(d) {return d.y.toFixed(1)});
            })
          .stop();
        
        // initialize simulation
        for (var i = 0; i < 300; ++i) { force.tick(); }
        force.alphaTarget(0.3)
          .restart();

        // change frame at interval
        var j = 1;
        d3.interval(function() {
          update_frame(j, leaves, dat, frames, area_to_value_ratio, circles, labels, 
            force, font_size, speed_factor, el, width, title_size);
          j++;
          if (j == frames.length) { j = 0; } // loop
        }, 2300 * speed_factor);

      },

      resize: function(width, height) {

        // update svg size
        svg.attr("width", width)
          .attr("height", height - height_offset);

        // update frame and main title size
        d3.select("p#frame").style("width", width + "px");
        d3.select("p#main").style("width", width + "px");

        // recalculate area_to_value_ratio
        var leaves_tmp = get_leaves(starting_dat, width, height, height_offset);
        area_to_value_ratio = calculate_area_to_value_ratio(leaves_tmp, bubble_size);

        // update force
        force.force("center", d3.forceCenter(width / 2, (height - height_offset) / 2));
        force.force("charge", d3.forceManyBody().strength(adjust_charge_strength(width, height - height_offset, leaves)));  
      }
    }
  }
});

function adjust_charge_strength(width, height, leaves){
  var radius_array = d3.values(leaves).map(function(d) {return d.r});
  var small_bubble_count = radius_array.filter(function(r) {return (r < 10 && r > 1)}).length;
  var initial_strength = 2 + Math.pow(1/Math.exp(1), small_bubble_count) * 10;
  return initial_strength + Math.round(Math.min(width, height) / 200);
}

function get_leaves(dat, width, height, height_offset){
  return d3.pack().size([width, height - height_offset]).padding(5)(
    d3.hierarchy({children: dat})
    .sum(function(d) {return d.value})
  ).leaves();
}

function calculate_area_to_value_ratio(leaves, bubble_size){
  return Math.pow(leaves[0].r,2) / leaves[0].value * bubble_size;
}

function update_leaves(leaves, dat, frames, j, area_to_value_ratio){
  for(var i = 0; i < leaves.length; i++){
    var result = dat.filter(function(d) {return (d.frame == frames[j])})
      .filter(function(d) {return (d.key == leaves[i].data.key)});
    leaves[i].r = (result.length !== 0) ? Math.sqrt(result[0].value*area_to_value_ratio) : 0;
    leaves[i].data.value = (result.length !== 0) ? result[0].value : 0;
  }
  return leaves;
}

function update_frame(j, leaves, dat, frames, area_to_value_ratio, circles, labels, 
  force, font_size, speed_factor, el, width, title_size){

  // update leaves to next j
  leaves = update_leaves(leaves, dat, frames, j, area_to_value_ratio);

  // update force strength when all bubbles are small
  var leaves_x = d3.values(leaves).map(function(d) {return d.x}).map(function (num, idx) {
    return {
      xmin: num - d3.values(leaves).map(function(d) {return d.r})[idx],
      xmax: num + d3.values(leaves).map(function(d) {return d.r})[idx]
    }
  });
  var leaves_y = d3.values(leaves).map(function(d) {return d.y}).map(function (num, idx) {
    return {
      ymin: num - d3.values(leaves).map(function(d) {return d.r})[idx],
      ymax: num + d3.values(leaves).map(function(d) {return d.r})[idx]
    }
  });
  var pack_width = d3.max(d3.values(leaves_x).map(function(d) {return d.xmax})) - d3.min(d3.values(leaves_x).map(function(d) {return d.xmin}));
  var pack_height = d3.max(d3.values(leaves_y).map(function(d) {return d.ymax})) - d3.min(d3.values(leaves_y).map(function(d) {return d.ymin}));
  force.force("charge", d3.forceManyBody().strength(adjust_charge_strength(pack_width, pack_height, leaves)));

  // transition setting for circles and labels
  var t = d3.transition().duration(Math.round( 1400 * speed_factor))
    .ease(d3.easeLinear).tween('update', function(d) {
      return function(t) { 
        force.nodes(leaves); 
        force.alphaTarget(0.3)
          .restart(); 
        };
    })

  // transition circles and labels
  circles.transition(t).attr("r", function(d) {return d.r.toFixed(1)});
  labels.transition(t)
    .attr("font-size", function(d) { return Math.round(2 * d.r * 0.2 * font_size) + "px"; });
  
  d3.select("p#frame")
    .transition()
    .duration(Math.round( 1600 * speed_factor))
    .ease(d3.easeSinOut)
    .on("start", function repeat() {
      var t = d3.active(this)
        .style("opacity", 0)
        .remove();
      
        d3.select(el).append("p")
            .attr("id", "frame")
            .attr("class", "title")
            .style("width", width + "px")
            .style("font-size", title_size)
            .text(frames[j])
            .style("opacity", 0)
          .transition()
            .duration(Math.round( 1600 * speed_factor))
            .ease(d3.easeQuad)
            .style("opacity", 1);
    })
}

function hex_to_rgb(hex){
  hex = (hex.length = 9) ? hex.substring(0,7) : hex;
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function get_font_color(hex){
  var rbg = hex_to_rgb(hex);
  // https://stackoverflow.com/questions/1855884/
  // Counting the perceptive luminance - human eye favors green color
  var luminance = 1 - ( 0.299 * rbg.r + 0.587 * rbg.g + 0.114 * rbg.b ) / 255
  return luminance < 0.5 ? "#303030" : "#dfdfdf";
}