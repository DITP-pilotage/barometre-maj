library(stringr)

#' Export indicator data to separate files, based on indic_id
#'
#' @param indic_data Data to split in files
#'
#' @return
#' @export
#'
#' @examples
split_in_files <- function(indic_data, export_config_filepath, export_name) {
  
  export_config <- read_csv(export_config_filepath, show_col_types = FALSE)
  view_meta_indicateur <- read_csv("../config/view_meta_indicateur.csv", show_col_types = FALSE)
  
  ROOT_OUT_DIR <- '../data/exports/'
  OUT_DIR <- paste0(ROOT_OUT_DIR, export_name, "/")
  # delete dir
  unlink(OUT_DIR, recursive = TRUE)
  # create dir
  dir.create(OUT_DIR, showWarnings = FALSE)
  
  # Df filtré en ne gardant que les indicateurs qui sont spécifiés pour cet export
  indic_data_filtered <- 
    view_meta_indicateur %>%
    filter(indic_is_baro) %>% 
    select(indic_id) %>% 
    left_join(indic_data, by="indic_id")

  data_splitted <- split(indic_data_filtered, indic_data_filtered$indic_id)
  
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


