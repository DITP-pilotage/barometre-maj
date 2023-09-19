source('R/load_data.R')
source('R/transform_data_pilote.R')
source('R/merge_transformed_pilote_hist.R')
source('R/split_in_files.R')

data_hist <- load_data_hist()

data_pilote <- load_data_pilote()

r <- data_pilote %>%
  transform_data_pilote(data_hist) %>%
  merge_transformed_pilote_hist(
    transformed_data_pilote = ., 
    data_hist = data_hist
  ) 

r %>%
  split_in_files(indic_data = .)  


terr<-read_csv("../data/ref/territoire.csv", show_col_types = FALSE)

data_hist_formatted <- hist_to_baro(data_hist)
data_pilote_formatted <- pilote_to_baro(data_pilote, terr)

combine_hist_and_pilote_data(data_hist_formatted, data_pilote_formatted %>%head(0), terr) %>%
  select(-is_pilote, -is_hist) %>%
  split_in_files()



# TODO: correct dupplicates:
## on 1 column: indic_va
r %>% count(indic_id, enforce_zone_id, metric_enforce_date, indic_va) %>% filter(n>1 & !is.na(indic_va))
r%>%filter(indic_id=="IND-263" & enforce_zone_id=="D10" & metric_enforce_date=="2022-12-31" & indic_va==376)
## on multiple columns: 
r %>% count(indic_id, enforce_zone_id, metric_enforce_date) %>% arrange(-n) %>% filter(n>1)
r%>%filter(indic_id=="IND-200" & enforce_zone_id=="R01" & metric_enforce_date=="2022-05-31")

data_hist %>% filter(indic_id=="IND-263", enforce_zone_id=="D01", metric_enforce_date=="2022-12-31", indic_va==523)

