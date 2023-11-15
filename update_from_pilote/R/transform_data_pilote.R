#' Transform Pilote data in format of historic data
#'
#' @param data_pilote Pilote data to transform
#'
#' @return
#' @export
#'
#' @examples
transform_data_pilote <- function(data_pilote_, data_hist) {
  
  terr<-read_csv("../data/ref/territoire.csv", show_col_types = FALSE)
  
  add_zoneid <- function(df_, terr_) {
    df_ %>%
      mutate(code=paste0(maille, '-', code_insee)) %>%
      left_join((terr_%>%select(code, zone_id)), by=c("code")) %>%
      select(-code, enforce_zone_id=zone_id)
  }
  
  
  
  # vi
  extracted_vi <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, indic_vi=valeur_initiale, metric_enforce_date=date_valeur_initiale
    ) %>%
    filter(!is.na(indic_vi))%>% add_zoneid(terr) %>%
    # Remove duplicates from data_hist
    left_join((data_hist%>%select(-indic_vc, -indic_va, -indic_ta, -maille)%>%mutate(in_hist=T)), by=c("indic_id", "enforce_zone_id", "metric_enforce_date", "indic_vi" )) %>%
    filter(is.na(in_hist))
  
  # vc intermediaire
  extracted_vc1 <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, vc_inter=objectif_valeur_cible_intermediaire, metric_enforce_date=objectif_date_valeur_cible_intermediaire
    ) %>%
    filter(!is.na(vc_inter)) %>% add_zoneid(terr) %>%
    # Remove duplicates from data_hist
    left_join((data_hist%>%select(-indic_ta, -indic_va, -indic_vi, -maille)%>%mutate(in_hist=T) %>% rename(vc_inter=indic_vc)), by=c("indic_id", "enforce_zone_id", "metric_enforce_date", "vc_inter" )) %>%
    filter(is.na(in_hist))
  
  # vc globale
  extracted_vc2 <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, vc_glob=objectif_valeur_cible, metric_enforce_date=objectif_date_valeur_cible
    ) %>%
    filter(!is.na(vc_glob)) %>% add_zoneid(terr)
  
  # ta intermediaire
  extracted_ta1 <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, ta_inter=objectif_taux_avancement_intermediaire, metric_enforce_date=date_valeur_actuelle
    ) %>%
    filter(!is.na(ta_inter))%>% add_zoneid(terr) %>%
    # Remove duplicates from data_hist
    left_join((data_hist%>%select(-indic_vc, -indic_va, -indic_vi, -maille)%>%mutate(in_hist=T) %>% rename(ta_inter=indic_ta)), by=c("indic_id", "enforce_zone_id", "metric_enforce_date", "ta_inter" )) %>%
    filter(is.na(in_hist))
  
  # ta global
  extracted_ta2 <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, ta_glob=objectif_taux_avancement, metric_enforce_date=date_valeur_actuelle
    ) %>%
    filter(!is.na(ta_glob)) %>% add_zoneid(terr)
  
  # va
  unnest_va_df <- data_pilote_ %>%
    select(id, maille, code_insee, eva= evolution_valeur_actuelle) %>%
    filter(!is.na(eva)) %>%
    mutate(unnest_va = strsplit(as.character(str_sub(eva, 2, str_length(eva)-1)), ",")) %>% 
    unnest(unnest_va) %>%
    mutate(r = row_number())
  
  unnest_va_dates_df <- data_pilote_ %>%
    select(id, maille, code_insee, eva= evolution_date_valeur_actuelle) %>%
    filter(!is.na(eva)) %>%
    mutate(unnest_va_dates = strsplit(as.character(str_sub(eva, 2, str_length(eva)-1)), ",")) %>% 
    unnest(unnest_va_dates) %>%
    mutate(
      r = row_number(), 
      unnest_va_dates = as.Date(str_sub(unnest_va_dates, 2, str_length(unnest_va_dates)-1))
    )
  
  extracted_va <-
    unnest_va_df %>%
    left_join(unnest_va_dates_df, by=c("id", "r")) %>%
    select(
      indic_id=id, maille = maille.x, code_insee = code_insee.x, indic_va=unnest_va, metric_enforce_date=unnest_va_dates
    ) %>% mutate(indic_va = as.numeric(indic_va)) %>% add_zoneid(terr) %>%
    # Remove duplicates from data_hist
    left_join((data_hist%>%select(-indic_vc, -indic_ta, -indic_vi, -maille)%>%mutate(in_hist=T)), by=c("indic_id", "enforce_zone_id", "metric_enforce_date", "indic_va" )) %>%
    filter(is.na(in_hist))
  
  
  transformed_data_pilote <-
    extracted_vi %>%
    full_join(extracted_vc1, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    full_join(extracted_vc2, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    full_join(extracted_va, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    full_join(extracted_ta1, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    full_join(extracted_ta2, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    filter(
      !(is.na(indic_vi) & is.na(indic_va) & is.na(vc_inter) & is.na(vc_glob) & is.na(ta_inter) & is.na(ta_glob))
    ) %>% 
    mutate(zone_code=paste0(maille,"-",code_insee)) %>% 
    # Get correct zone_id
    left_join((terr %>% select(code, zone_id)), by=c("zone_code"="code")) %>%
    select(
      indic_id, enforce_zone_id=zone_id, metric_enforce_date, 
      indic_vi, indic_va, indic_vc_inter=vc_inter, indic_vc_glob=vc_glob,
      maille, indic_ta_inter= ta_inter, indic_ta_glob= ta_glob
    ) %>%
    arrange(indic_id, enforce_zone_id, metric_enforce_date)
  
  transformed_data_pilote
}