#' Transform Pilote data in format of historic data
#'
#' @param data_pilote Pilote data to transform
#'
#' @return
#' @export
#'
#' @examples
transform_data_pilote <- function(data_pilote_) {
  
  
  # vi
  extracted_vi <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, vi=valeur_initiale, metric_enforce_date=date_valeur_initiale
    ) %>%
    filter(!is.na(vi))
  
  # vc intermediaire
  extracted_vc1 <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, vc_inter=objectif_valeur_cible_intermediaire, metric_enforce_date=objectif_date_valeur_cible_intermediaire
    ) %>%
    filter(!is.na(vc_inter))
  
  # vc globale
  extracted_vc2 <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, vc_glob=objectif_valeur_cible, metric_enforce_date=objectif_date_valeur_cible
    ) %>%
    filter(!is.na(vc_glob))
  
  # ta intermediaire
  extracted_ta1 <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, ta_inter=objectif_taux_avancement_intermediaire, metric_enforce_date=date_valeur_actuelle
    ) %>%
    filter(!is.na(ta_inter))
  
  # ta global
  extracted_ta2 <-
    data_pilote_ %>%
    select(
      indic_id= id, maille, code_insee, ta_glob=objectif_taux_avancement, metric_enforce_date=date_valeur_actuelle
    ) %>%
    filter(!is.na(ta_glob))
  
  # va
  unnest_va_df <- data_pilote_ %>%
    select(id, maille, code_insee, eva= evolution_valeur_actuelle) %>%
    mutate(unnest_va = strsplit(as.character(str_sub(eva, 2, str_length(eva)-1)), ",")) %>% 
    unnest(unnest_va) %>%
    mutate(r = row_number())
  
  unnest_va_dates_df <- data_pilote_ %>%
    select(id, maille, code_insee, eva= evolution_date_valeur_actuelle) %>%
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
      indic_id=id, maille = maille.x, code_insee = code_insee.x, va=unnest_va, metric_enforce_date=unnest_va_dates
    ) %>% mutate(va = as.numeric(va))
  
  transformed_data_pilote <-
    extracted_vi %>%
    full_join(extracted_vc1, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    full_join(extracted_vc2, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    full_join(extracted_va, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    full_join(extracted_ta1, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    full_join(extracted_ta2, by=c("indic_id", "metric_enforce_date", "maille", "code_insee")) %>%
    select(
      indic_id, code_insee, metric_enforce_date, 
      indic_vi=vi, indic_va=va, indic_vc_inter=vc_inter, indic_vc_glob=vc_glob,
      maille, indic_ta_inter= ta_inter, indic_ta_glob= ta_glob
    ) %>% 
    filter(
      !(is.na(indic_vi) & is.na(indic_va) & is.na(indic_vc_inter) & is.na(indic_vc_glob) & is.na(indic_ta_inter) & is.na(indic_ta_glob))
    )
  
  transformed_data_pilote
}