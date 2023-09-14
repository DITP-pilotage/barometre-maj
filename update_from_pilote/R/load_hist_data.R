library(readr)
library(magrittr)
library(dplyr)

loadHistData <- function() {
  # Dir containing historic data
  HIST_DIR <- '../data/datagouv_1_hist/'
  
  # Load and combine all files of this dir
  list.files(HIST_DIR,full.names = T) %>% 
    lapply( function(x) read_csv(file = x, show_col_types = FALSE)) %>% 
    bind_rows %>% 
    as_tibble()
}