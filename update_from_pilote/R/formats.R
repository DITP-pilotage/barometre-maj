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


# Transform data from format pilote to format baro
pilote_to_baro <- function(data_pilote_, terr_) {
  cleaned_data_pilote <-
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
    mutate(r=row_number()) %>%
    arrange(indic_id, enforce_zone_id, va_date)
  
  ## Format values for: vi vc_inter vc_glob ta_inter ta_glob
  format_vi_vc_ta <- 
    cleaned_data_pilote %>%
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
    select(-vi_date, -vc_glob_date, -vc_inter_date, -ta_date) %>%
    pivot_wider(names_from = metric_type, values_from = metric_value) %>%
    rename(
      indic_vi=vi,
      indic_vc_glob=vc_glob,
      indic_vc_inter=vc_inter,
      indic_ta_inter=ta_inter,
      indic_ta_glob=ta_glob
      )
  
  
  ## Format va
  format_va <-
    cleaned_data_pilote %>%
    select(indic_id, enforce_zone_id, va_evol, va_evol_date, r) %>%
    # Remove curly braces
    mutate(va_evol=str_sub(va_evol, 2, -2), va_evol_date=str_sub(va_evol_date, 2, -2)) %>%
    # Explode array
    separate_longer_delim(c(va_evol, va_evol_date), delim = ",") %>%
    # Cast to date
    mutate(va_evol=as.double(va_evol), metric_enforce_date=as.Date(str_sub(va_evol_date, 2, -2)))%>%
    select(indic_id, enforce_zone_id, metric_enforce_date, indic_va=va_evol, r)
  
  ## Combine format_vi_vc_ta + format_va
  format_vi_vc_ta %>%
    full_join(format_va, by=c("indic_id", "enforce_zone_id", "metric_enforce_date")) %>%
    mutate(r=coalesce(r.x, r.y), is_pilote=T) %>% select(-r.x, -r.y)
  
}


combine_hist_and_pilote_data <- function(data_hist_formatted_, data_pilote_formatted_, terr_) {

  
  
  # join hist data and pilote data
  intermediate <- data_pilote_formatted_ %>%
    full_join(data_hist_formatted_, by=c(
      "indic_id", "enforce_zone_id", "metric_enforce_date"
    ), suffix=c(".pilote", ".hist")) 
  
  # introspect data
  modified_vals <- intermediate %>%
    # values modified compared to hist data
    filter(!is.na(indic_va.pilote) & !is.na(indic_va.hist)) %>% filter(indic_va.hist != indic_va.pilote)
  
  
  intermediate %>%
    # prefer value in pilote
    mutate(
      indic_vi= coalesce(indic_vi.pilote, indic_vi.hist),
      indic_va= coalesce(indic_va.pilote, indic_va.hist),
      indic_vc_inter= coalesce(indic_vc_inter.pilote, indic_vc_inter.hist),
      indic_ta_inter= coalesce(indic_ta_inter.pilote, indic_ta_inter.hist),
      indic_vc_glob= coalesce(indic_vc_glob.pilote, indic_vc_glob.hist),
      indic_ta_glob= coalesce(indic_ta_glob.pilote, indic_ta_glob.hist)
    ) %>%
    select(-ends_with(c(".pilote", ".hist"))) %>%
    arrange(indic_id, enforce_zone_id, metric_enforce_date)
  
  
}

data_hist_formatted <- hist_to_baro(data_hist)
data_pilote_formatted <- pilote_to_baro(data_pilote, terr)

combine_hist_and_pilote_data(data_hist_formatted, data_pilote_formatted, terr)

  


