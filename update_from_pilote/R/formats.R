# Transform data from format hist to format baro
hist_to_baro <- function(data_hist_) {
  data_hist_ %>%
    select(
      indic_id, enforce_zone_id, metric_enforce_date, 
      indic_vi, indic_va, 
      ## indic_vc -> indic_vc_inter
      indic_vc_inter=indic_vc,
      maille, 
      ## indic_ta -> indic_ta_inter
      indic_ta_inter=indic_ta
    ) %>% mutate(
      is_hist=T,
      indic_vc_glob=NA,
      indic_ta_glob=NA,
      r=row_number()
    ) %>%
    arrange(indic_id, enforce_zone_id, metric_enforce_date)
}

data_hist_formatted <- hist_to_baro(data_hist)

# Transform data from format pilote to format baro
pilote_to_baro <- function(data_pilote_, terr_) {
  data_pilote_ %>%
    # Add enforce_zone_id
    mutate(code=paste0(maille, '-', code_insee)) %>%
    left_join((terr_%>%select(code, zone_id)), by=c("code")) %>%
    select(-code, enforce_zone_id=zone_id) %>%
    # clean cols
    select(indic_id=id, enforce_zone_id,
           va_date=date_valeur_actuelle, va=valeur_actuelle, 
           va_evol_date=evolution_date_valeur_actuelle, va_evol=evolution_valeur_actuelle,
           vi_date=date_valeur_initiale, vi=valeur_initiale, 
           maille,
           vc_glob_date=objectif_date_valeur_cible, vc_glob=objectif_valeur_cible,
           vc_inter_date=objectif_date_valeur_cible_intermediaire, vc_inter=objectif_valeur_cible_intermediaire,
           ta_inter=objectif_taux_avancement_intermediaire, ta_glob=objectif_taux_avancement
           )%>% 
    mutate(is_pilote=T, r=row_number()) %>%
    arrange(indic_id, enforce_zone_id, va_date)
  
}


data_pilote_formatted <- pilote_to_baro(data_pilote, terr)

## Format values for: vi vc_inter vc_glob ta_inter ta_glob
data_pilote_formatted %>%
  select(indic_id, enforce_zone_id, vi_date, vi, vc_glob_date, vc_glob, vc_inter_date, vc_inter, ta_inter, ta_glob, ta_date=va_date, r) %>%
  pivot_longer(cols = c("vi", "vc_inter", "vc_glob", "ta_inter", "ta_glob"), names_to = c("metric_type"), values_to = c("metric_value")) %>%
  filter(!is.na(metric_value)) %>%
  mutate(metric_enforce_date= case_when(
    metric_type=="vi" ~ vi_date,
    metric_type=="vc_glob" ~ vc_glob_date,
    metric_type=="vc_inter" ~ vc_inter_date,
    metric_type=="ta_inter" ~ ta_date,
    metric_type=="ta_glob" ~ ta_date
  )) %>%
  select(-vi_date, -vc_glob_date, -vc_inter_date) %>%
  pivot_wider(names_from = metric_type, values_from = metric_value)

