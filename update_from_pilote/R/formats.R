# Transform data from format hist to format baro
hist_to_baro <- function(data_hist_) {
  data_hist_ %>%
    select(
      indic_id, enforce_zone_id, metric_enforce_date, 
      indic_vi, indic_va, 
      ## indic_vc -> indic_vc
      indic_vc=indic_vc,
      maille, 
      ## indic_ta -> indic_ta
      indic_ta=indic_ta
    ) %>% mutate(
      is_hist=T,
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
           vc_date=objectif_date_valeur_cible, vc=objectif_valeur_cible,
           ta=objectif_taux_avancement
           )%>% 
    mutate(r=row_number()) %>%
    arrange(indic_id, enforce_zone_id, va_date)
  
  ## Format values for: vi vc  ta
  format_vi_vc_ta <- 
    cleaned_data_pilote %>%
    select(indic_id, enforce_zone_id, vi_date, vi, vc_date, vc, ta, ta_date=va_date, maille, r) %>%
    pivot_longer(cols = c("vi", "vc", "ta"), names_to = c("metric_type"), values_to = c("metric_value")) %>%
    filter(!is.na(metric_value)) %>%
    mutate(metric_enforce_date= case_when(
      metric_type=="vi" ~ vi_date,
      metric_type=="vc" ~ vc_date,
      metric_type=="ta" ~ ta_date
    )) %>%
    select(-vi_date, -vc_date, -ta_date) %>%
    pivot_wider(names_from = metric_type, values_from = metric_value) %>%
    rename(
      indic_vi=vi,
      indic_vc=vc,
      indic_ta=ta
      )
  
  
  ## Format va
  format_va <-
    cleaned_data_pilote %>%
    select(indic_id, enforce_zone_id, va_evol, va_evol_date, r, maille) %>%
    # Remove curly braces
    mutate(va_evol=str_sub(va_evol, 2, -2), va_evol_date=str_sub(va_evol_date, 2, -2)) %>%
    # Explode array
    separate_longer_delim(c(va_evol, va_evol_date), delim = ",") %>%
    # Cast to date
    mutate(va_evol=as.double(va_evol), metric_enforce_date=as.Date(str_sub(va_evol_date, 2, -2)))%>%
    select(indic_id, enforce_zone_id, metric_enforce_date, indic_va=va_evol, maille, r)

  ## Combine format_vi_vc_ta + format_va
  format_vi_vc_ta %>%
    full_join(format_va, by=c("indic_id", "enforce_zone_id", "metric_enforce_date")) %>%
    mutate(r=coalesce(r.x, r.y), is_pilote=T) %>% select(-r.x, -r.y) %>%
    filter(!(is.na(indic_vi) & is.na(indic_va) & is.na(indic_vc) & is.na(indic_ta)))
  
  
}


combine_hist_and_pilote_data <- function(data_hist_formatted_, data_pilote_formatted_, terr_) {

  
  
  # join hist data and pilote data on date of MONTH
  intermediate <- 
    data_pilote_formatted_ %>%
    # get last day of month
    mutate(metric_enforce_date_month=ceiling_date(as.Date(metric_enforce_date), 'month') - days(1)) %>%
    full_join(
      (data_hist_formatted_ %>% mutate(metric_enforce_date_month=ceiling_date(as.Date(metric_enforce_date), 'month') - days(1)))
      , by=c(
      "indic_id", "enforce_zone_id", "metric_enforce_date_month"
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
      indic_vc= coalesce(indic_vc.pilote, indic_vc.hist),
      indic_ta= coalesce(indic_ta.pilote, indic_ta.hist),
      maille= coalesce(maille.x, maille.y, maille)
    ) %>%
    select(-ends_with(c(".pilote", ".hist", "maille.x", "maille.y"))) %>%
    arrange(indic_id, enforce_zone_id, metric_enforce_date_month)

}
