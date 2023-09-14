library(magrittr)


# This demo function simply sorts hist_data and ignores pilote_data.
tf_sort_hist_data <- function(transformed_data_pilote_, data_hist_) {
  data_hist_ %>%
    arrange(indic_id, enforce_zone_id, metric_enforce_date)
}


#' Merge transformed data from pilote with historic data
#' 
#' @param transformed_data_pilote Pilote data transformed by function "transform_data_pilote". Format historic data
#' @param data_hist Historic data
#'
#' @return Merge df in format of historic data
#' @export
#'
#' @examples
merge_transformed_pilote_hist <- function(transformed_data_pilote_, data_hist_) {
  tf_sort_hist_data(transformed_data_pilote_, data_hist_)
}

