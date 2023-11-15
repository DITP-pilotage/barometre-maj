library(readr)
library(magrittr)
library(dplyr)

load_data_hist <- function() {
  # Dir containing historic data
  HIST_DIR <- '../data/datagouv_1_hist/'
  
  # Load and combine all files of this dir
  list.files(HIST_DIR,full.names = T) %>% 
    lapply( function(x) read_csv(file = x, show_col_types = FALSE)) %>% 
    bind_rows %>% 
    as_tibble()
}

load_data_pilote <- function() {
  # Dir containing pilote data
  HIST_DIR <- '../data/pilote_current/'
  
  # Load and combine all files of this dir
  list.files(HIST_DIR,full.names = T) %>% 
    lapply( function(x) read_csv(file = x, show_col_types = FALSE)) %>% 
    bind_rows %>% 
    as_tibble()
}