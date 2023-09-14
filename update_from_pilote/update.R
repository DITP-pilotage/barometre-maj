source('R/load_data.R')
source('R/transform_data_pilote.R')
source('R/merge_transformed_pilote_hist.R')
source('R/split_in_files.R')

data_hist <- load_data_hist()

data_pilote <- load_data_pilote()

data_pilote %>%
  transform_data_pilote() %>%
  merge_transformed_pilote_hist(
    transformed_data_pilote = ., 
    data_hist = data_hist
  ) %>%
  split_in_files(indic_data = .)  

