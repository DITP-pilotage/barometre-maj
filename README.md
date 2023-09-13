# barometre-maj

Processus de mise à jour des fichiers sources du [baromètre de l'action publique](https://www.gouvernement.fr/politiques-prioritaires). Ces fichiers sont la source du *dataset* correspondant sur [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/barometre-des-resultats-de-laction-publique-1/).


## Usage

Les étapes pour mettre à jour les données:
- new branch *data-update* from *pre-prod*
- update files
- pr from *data-update* to *pre-prod*
- merge pr
- download pr results from github API
- verify resource exists in datagouv dataset **for each updated files in PR**:
    + if yes: update their date/descricption (commit, pr)
    + else: create resource
    + delete resources with no associated file in the repo
    + comment in PR the log results of the verify step
- check pre-prod results
- pr from *pre-prod* to *prod*
- merge pr
- verify
- check prod results
- delete branch *data-update*

branches: prod (datagouv), pre-prod (demo datagouv), data-update (no remote data fs)

