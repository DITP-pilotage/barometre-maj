FROM rocker/tidyverse:4.3.1

WORKDIR /app/update_from_pilote

# Copy and install dependencies
COPY update_from_pilote/dependencies.R dependencies.R
RUN Rscript dependencies.R

ENTRYPOINT Rscript update.R