#' Animated Bubble Chart
#'
#' MovingBubbles can be used to plot bubble chart with transitions.
#'
#'@param df dataframe
#'@param key name of key column
#'@param value name of value column
#'@param frame name of frame column
#'@param color name of color column
#'
#'@examples
#'dat <- data.frame(data = rep(letters[1:6],5),
#'                  value = round(runif(30)*100),
#'                  time = rep(paste0(1:5, "pm"), each = 6),
#'                  value2 = runif(30))
#'MovingBubbles(dat, key = "data", value = "value", frame = "time")
#'MovingBubbles(dat, key = "data", value = "value", frame = "time", color = "value2")
#'
#' @import htmlwidgets
#'
#' @export
MovingBubbles <- function(df, key, value, frame, color = NULL, width = NULL, height = NULL, elementId = NULL) {

  # factorize df$frame if not already
  if (class(df[[frame]]) != "factor"){
    df[[frame]] <- factor(df[[frame]])
  }
  
  # check if color column is numeric
  if (!is.null(color)){
    if (is.double(df[[color]]) | is.integer(df[[color]])) {
    color_numeric <- 1
    } else {color_numeric <- 0}
  }

  # forward options using opts
  if (is.null(color)){
    opts = list(data.frame(
      key = df[[key]],
      value = df[[value]],
      frame = df[[frame]]
    ), levels(df[[frame]]),
    0, # color
    0
    )
  } else {
    opts = list(data.frame(
      key = df[[key]],
      value = df[[value]],
      frame = df[[frame]],
      color = df[[color]]
    ), levels(df[[frame]]),
    1, # color
    color_numeric
    )
  }

  # create widget
  htmlwidgets::createWidget(
    name = 'MovingBubbles',
    opts,
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
