library(stringr)

#' Export indicator data to separate files, based on indic_id
#'
#' @param indic_data Data to split in files
#'
#' @return
#' @export
#'
#' @examples
split_in_files <- function(indic_data) {
  OUT_DIR <- '../data/datagouv_3_updated/'
  data_splitted <- split(indic_data, indic_data$indic_id)
  
  written_rows_cnt <- lapply(data_splitted, function(df_indic){
    current_indic <- as.character(unique(df_indic[["indic_id"]]))
    outfile <- paste0(OUT_DIR, tolower(current_indic), ".csv")
    nb_rows <- nrow(df_indic)
    
    write_csv(df_indic, outfile, na = "")
    message(paste0(
      '[', current_indic, '] - ', 
      str_pad(nb_rows, 7, side = 'left', pad= ' '), 
      ' rows written in ', outfile
    ))
    
    nb_rows
  })
}


