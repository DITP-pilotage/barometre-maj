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
    ) %>% mutate(is_hist=T) %>%
    arrange(indic_id, enforce_zone_id, metric_enforce_date)
}

hist_to_baro(data_hist)

# Transform data from format pilote to format baro
pilote_to_baro <- function(data_pilote_, terr_) {
  data_pilote_ %>%
    # Add enforce_zone_id
    mutate(code=paste0(maille, '-', code_insee)) %>%
    left_join((terr_%>%select(code, zone_id)), by=c("code")) %>%
    select(-code, enforce_zone_id=zone_id) %>%
    # clean cols
    select(id, enforce_zone_id, objectif_valeur_cible, objectif_taux_avancement, date_valeur_actuelle, 
           date_valeur_initiale, valeur_actuelle, valeur_initiale, maille, evolution_valeur_actuelle,
           evolution_date_valeur_actuelle, objectif_date_valeur_cible, objectif_date_valeur_cible_intermediaire, 
           objectif_taux_avancement_intermediaire, objectif_valeur_cible_intermediaire
           )%>% 
    mutate(is_pilote=T) %>%
    arrange(id, enforce_zone_id, date_valeur_actuelle)
  
}


pilote_to_baro(data_pilote, terr)
