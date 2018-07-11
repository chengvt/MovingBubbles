# MovingBubbles : Animated d3 bubble chart
The package provides a method to add the second information dimension, which can be either qualitative or quantitative, to the bubble chart by means of animation. The plotting and transitions between frames are handled by [d3 library](https://d3js.org/). The package uses [htmlwidgets](https://www.htmlwidgets.org/) framework to bridge Javascript and R.

# Usage & Demo
The function takes in a data.frame with key, value, and frame columns. Optional data.frame with key and color (hex) can be given to specify the bubble color. The frame column will be factorized if not already and the order of factor levels will be used to run the animation sequentially. Thus, the sequence can be defined by manually setting the levels of the frame column.

    library(MovingBubbles)
    dat <- data.frame(alphabets = rep(letters[1:6],5),
                      time = rep(paste0(1:5, "pm"), each = 6),
                      size = round(runif(30)*100))
    dat$time <- factor(dat$time, levels = rep(paste0(1:5, "pm")))
    MovingBubbles(dat, key = "alphabets", frame = "time", value = "size")

[demo (AKB48 election result visualization)](https://rawgit.com/chengvt/MovingBubbles/master/demo.html)

# Installation

    devtools::install_github("chengvt/MovingBubbles", dependencies = TRUE)

# Known Problems
- The plot is not shown in Viewer pane of Rstudio in Windows. I suspected that Rstudio Viewer pane uses internet explorer, which does not support the style of Javascript used in the package. One solution is to click on "show in new window" to open the plot in Chrome or Microsoft Edge.