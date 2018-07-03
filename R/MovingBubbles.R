#' Animated Bubble Chart
#'
#' MovingBubbles can be used to plot bubble chart with transitions.
#'
#'@param df dataframe
#'@param key name of key column
#'@param frame name of frame column
#'@param value name of value column
#'@param color name of color column
#'
#'@examples
#'dat <- data.frame(data = rep(letters[1:6],5),
#'                  value = round(runif(30)*100),
#'                  time = rep(paste0(1:5, "pm"), each = 6),
#'                  value2 = runif(30))
#'MovingBubbles(dat, key = "data", frame = "time", value = "value")
#'MovingBubbles(dat, key = "data", frame = "time", value = "value", color = "value2")
#'
#' @import htmlwidgets
#' @import dplyr
#' @importFrom magrittr extract extract2
#' @importFrom RColorBrewer brewer.pal
#' @importFrom colorRamps primary.colors
#'
#' @export
MovingBubbles <- function(df, key, frame, value, sizing_factor = 1, color = NULL, 
                          width = NULL, height = NULL, elementId = NULL) {
  
  df <- data.frame(key = df[[key]], frame = df[[frame]], value = df[[value]])

  # factorize df$frame if not already
  if (class(df$frame) != "factor"){ 
    df$frame <- factor(df$frame) 
    }

  # get starting df
  max_frame <- df %>% group_by(frame) %>% 
    summarize(value = sum(value)) %>% arrange(-value) %>%
    extract2(1) %>% extract(1)
  starting_df <- df %>% filter(frame == max_frame) %>%
    arrange(-value)
  hidden_keys <- data.frame(key = setdiff(unique(df$key), starting_df$key))
  if (nrow(hidden_keys) > 0) {
    for (i in 1:nrow(hidden_keys)) {
      starting_df <- rbind(starting_df, 
                           data.frame(key = hidden_keys$key[i],
                                      frame = max_frame,
                                      value = 0
                                      ))
    }
  }

  x = list(df, levels(df$frame), starting_df, sizing_factor)
  
  # create widget
  htmlwidgets::createWidget(
    name = 'MovingBubbles',
    x = x,
    width = width,
    height = height,
    package = 'MovingBubbles',
    elementId = elementId
  )
}

#' Shiny bindings for MovingBubbles
#'
#' Output and render functions for using MovingBubbles within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a MovingBubbles
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name MovingBubbles-shiny
#'
#' @export
MovingBubblesOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'MovingBubbles', width, height, package = 'MovingBubbles')
}

#' @rdname MovingBubbles-shiny
#' @export
renderMovingBubbles <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, MovingBubblesOutput, env, quoted = TRUE)
}
