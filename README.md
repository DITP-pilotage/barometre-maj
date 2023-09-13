# barometre-maj

Processus de mise à jour des fichiers sources du [baromètre de l'action publique](https://www.gouvernement.fr/politiques-prioritaires). Ces fichiers sont la source du *dataset* correspondant sur [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/barometre-des-resultats-de-laction-publique-1/).


## Usage

Pour mettre à jour les données, suivre les étapes suivantes:
- Télécharger les fichiers de datagouv dans `data/current_datagouv` et `data/updated_datagouv`. Normalement, aucun fichier ne doit être modifié dans le dossier `data/updated_datagouv`.
```sh
npm run start -- dl-datagouv -d ../data/current_datagouv
```
- Créer une branche *data-update* depuis la branche *pre-prod* (ou *test* durant le développement de l'application)
- Mettre à jour les fichiers 
- Créer sur Github une *pull request* depuis *data-update* vers *pre-prod* (ou *test*)
- Merger la *PR*
- Lancer la synchronisation de datagouv avec la numéro de la PR en paramètre. Cette commande effectue les taches suivantes:
```sh
npm run start -- push-datagouv 24
```
    + pour chaque fichier de données (par défaut, dossier `data/updated_datagouv`), sa description sera mise à jour avec le numéro de la PR en cours, et sa date de mise à jour également
    + si aucune *resource datagouv* ne porte le nom du fichier, une resource sera créée pointant cers ce fichier (avec le numéro de *PR* en description)
    + *TODO* Supprimer les *resources datagouv* qui n'ont pas de fichier en local
    + *TODO* Ajouter un commentaire dans la PR pour indiquer quels modifications ont été apportées sur datagouv lors de cette phase automatisée
- Regarder l'effet produit sur l'instance pre-prod du baromètre
- Créer puis merger une PR de *pre-prod* vers *prod*
- Lancer de nouveau la synchronisation sur cette branche. En effet, les *resources* créée lors du passage du script sur la branche *pre-prod* est un *dataset Datagouv* différent de celui de prod. Il faut donc synchroniser ce *dataset* également.
- Regarder l'effet produit sur l'instance prod du baromètre
- Supprimer la branche *data-update*
