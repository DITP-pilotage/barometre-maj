source('R/load_data.R')

data_hist <- load_data_hist()

data_pilote <- load_data_pilote()

data_hist %>% head()
data_pilote %>% head()
