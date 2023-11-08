source('R/load_data.R')
source('R/transform_data_pilote.R')
source('R/merge_transformed_pilote_hist.R')
source('R/split_in_files.R')
source('R/formats.R')

# Indicateurs pour lesquels on ne prend pas en compte les valeurs historiques
indic_ignore_hist <- c('IND-311')

data_hist <- load_data_hist() %>%
  filter(! indic_id %in% indic_ignore_hist) %>%
  # On suppr les VI historiques de IND-314 du 2022-12-31
  mutate(indic_vi=if_else((metric_enforce_date=="2022-12-31" & indic_id=="IND-314"),NA,indic_vi))

data_pilote <- load_data_pilote()

terr<-read_csv("../data/ref/territoire.csv", show_col_types = FALSE)

data_hist_formatted <- hist_to_baro(data_hist)
data_pilote_formatted <- pilote_to_baro(data_pilote, terr) %>%
  # suppr des VA postérieures à juillet-23 pour le moment pour le IND-301 et 302
  mutate(indic_va=if_else((metric_enforce_date>"2023-07-31" & indic_id=="IND-301"),NA,indic_va)) %>%
  mutate(indic_va=if_else((metric_enforce_date>"2023-07-31" & indic_id=="IND-302"),NA,indic_va))

combine_hist_and_pilote_data(data_hist_formatted, data_pilote_formatted, terr) %>%
  select(-is_pilote, -is_hist) %>%
  # On ignore le 232 si pas de date et REG
  filter(!(indic_id=="IND-232" & is.na(metric_enforce_date) & maille=="REG")) %>%
  # On ignore les valeurs sans date pour le 718,719,720
  filter(!(indic_id=="IND-718" & is.na(metric_enforce_date))) %>%
  filter(!(indic_id=="IND-719" & is.na(metric_enforce_date))) %>%
  filter(!(indic_id=="IND-720" & is.na(metric_enforce_date))) %>%
  # On ignore les valeurs de 02-2023 pour le 314
  filter(!(indic_id=="IND-314" & metric_enforce_date=="2023-02-28")) %>%
  # On ignore le 957 toutes les val REG et DEPT
  filter(!(indic_id=="IND-957" & (maille=="REG"|maille=="DEPT"))) %>%
  # On ignore le 301 toutes les val DEPT
  filter(!(indic_id=="IND-301" & maille=="DEPT")) %>%
  split_in_files("../config/export-config.csv", "ex_8_nov_23")
