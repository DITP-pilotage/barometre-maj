# barometre-maj

Processus de mise à jour des fichiers sources du [baromètre de l'action publique](https://www.gouvernement.fr/politiques-prioritaires). Ces fichiers sont la source du *dataset* correspondant sur [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/barometre-des-resultats-de-laction-publique-1/).


## Usage

Pour mettre à jour les données, suivre les étapes suivantes:
- Télécharger les fichiers de datagouv dans `data/current_datagouv` et `data/updated_datagouv`. Normalement, aucun fichier ne doit être modifié dans le dossier `data/updated_datagouv`.
```sh
npm run start -- dl-datagouv -d ../data/datagouv_2_current
```
- Créer une branche *data-update* depuis la branche *pre-prod* (ou *test* durant le développement de l'application)
- Mettre à jour les fichiers
- Retouner sur la branche initiale `git checkout pre-prod` ou `git checkout test`
- Créer sur Github une *pull request* depuis *data-update* vers *pre-prod* (ou *test*)
- Merger la *PR*
- Lancer la synchronisation de la branche avec datagouv. Le numéro de la PR doit être passé en paramètre. Par exemple:
```sh
npm run start -- push-datagouv 24
```
- Cette commande effectue les taches suivantes:
    + pour chaque fichier de données (par défaut, dossier `data/updated_datagouv`, cf variables [SOURCE_DIR_TO_UPLOAD_*](https://github.com/DITP-pilotage/barometre-maj/blob/075d9b5cd10e91e13c67e830d160b22f8bccdb26/cli/config.ts#L5-L6)), la description de la *resource datagouv* correspondante sera mise à jour avec le numéro de la PR en cours, et par conséquent sa date de dernière mise à jour
    + si aucune *resource datagouv* ne porte le nom du fichier, une resource sera créée pointant vers ce fichier (toujours avec le numéro de *PR* en description)
    + *TODO* Supprimer les *resources datagouv* qui n'ont pas de fichier en local
    + *TODO* Ajouter automatiquement un commentaire dans la PR pour indiquer quelles modifications ont été apportées sur datagouv lors de cette phase automatisée (créations/suppressions de resources)
- Regarder l'effet produit sur l'instance pre-prod du baromètre
- Créer puis merger une PR de *pre-prod* vers *prod*
- Lancer de nouveau la synchronisation sur cette branche. (En effet, les *resources* créée lors du passage du script sur la branche *pre-prod* est un *dataset Datagouv* différent de celui de prod. Il faut donc synchroniser ce *dataset* également.)
- Regarder l'effet produit sur l'instance prod du baromètre
- Supprimer la branche *data-update*

## Utilisation du script R

Dans le dossier `/docker`, use `docker-compose up`.