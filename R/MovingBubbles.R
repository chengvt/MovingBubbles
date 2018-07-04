#' Animated Bubble Chart
#'
#' MovingBubbles can be used to plot bubble chart with transitions.
#'
#'@param df dataframe
#'@param key name of key column
#'@param frame name of frame column
#'@param value name of value column
#'@param color dataframe with key and color columns
#'@param bubble_size bubble size factor
#'@param font_size font size factor
#'@param speed_factor speed factor (the lower the faster)
#'@param title_size title text size eg. "16px"
#'@param height_offset height for title space at the bottom
#'
#'@examples
#'dat <- data.frame(data = rep(letters[1:6],5),
#'                  value = round(runif(30)*100),
#'                  time = rep(paste0(1:5, "pm"), each = 6))
#'colordf <- data.frame(key = unique(dat$data), color = terrain.colors(6))
#'MovingBubbles(dat, key = "data", frame = "time", value = "value")
#'MovingBubbles(dat, key = "data", frame = "time", value = "value", color = colordf)
#'
#' @import htmlwidgets
#' @import dplyr
#' @importFrom magrittr extract extract2
#' @importFrom RColorBrewer brewer.pal
#' @importFrom colorRamps primary.colors
#'
#' @export
MovingBubbles <- function(df, key, frame, value, color = NULL, bubble_size = 1,
                          font_size = 1, speed_factor = 1, title_size = "20px",
                          height_offset = 35,
                          width = NULL, height = NULL, elementId = NULL) {
  
  df <- data.frame(key = df[[key]], frame = df[[frame]], value = df[[value]])
  
  # join in color data.frame
  if (is.null(color)) {
    color <- data.frame(key = unique(df$key), color = "#000000")
  } 
  df <- left_join(df, color, by = "key")
  
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
  suppressWarnings(hidden_keys <- data.frame(key = setdiff(unique(df$key), starting_df$key)) %>%
    left_join(color, by = "key") %>% mutate(frame = max_frame, value = 0) %>%
    select(key, frame, value, color))
  if (nrow(hidden_keys) > 0) {
      starting_df <- rbind(starting_df, hidden_keys)
  }

  x = list(df, levels(df$frame), starting_df, bubble_size, 
           font_size, speed_factor, title_size, height_offset)
  
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
