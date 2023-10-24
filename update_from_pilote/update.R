source('R/load_data.R')
source('R/transform_data_pilote.R')
source('R/merge_transformed_pilote_hist.R')
source('R/split_in_files.R')
source('R/formats.R')

data_hist <- load_data_hist()

data_pilote <- load_data_pilote()

terr<-read_csv("../data/ref/territoire.csv", show_col_types = FALSE)

data_hist_formatted <- hist_to_baro(data_hist)
data_pilote_formatted <- pilote_to_baro(data_pilote, terr)

combine_hist_and_pilote_data(data_hist_formatted, data_pilote_formatted, terr) %>%
  select(-is_pilote, -is_hist) %>%
  split_in_files("../config/export-config.csv", "export_oct_23")
