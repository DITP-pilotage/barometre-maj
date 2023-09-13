import { Command, Help } from 'commander';
const program = new Command();
import {dlDatagouvFiles} from './dl_datagouv_files';
import { notifyDatagouvChanges } from './notify_datagouv_changes';
import { Helpers } from './helpers';
import { config } from './config';

program
  .name('barometre-maj')
  .description("CLI pour mettre à jour les données du baromètre de l'action publique")
  .version('0.0.1');

program.command('dl-datagouv')
  .description('Télécharge les fichiers actuellement présents sur datagouv')
  .option('-d, --destination <path>', 'destination directory')
  .action(async (opts:{destination: string}, _:any) => {
    console.log({opts});
    
    await dlDatagouvFiles(opts.destination);

  });


program.command('push-datagouv')
  .description('Met à jour les resources du jeu de données datagouv')
  .argument('<pr-id>', 'Identifiant de la PR à inspecter')
  .option('-d, --directory <path>', 'source directory')
  .action(async (pr_id: number, opts:{directory: string}) => {
    console.log({opts});
    
    let modifiedFilesInPR: string[] = await Helpers.getUpdatedFilesPR(pr_id, config.SOURCE_DIR_TO_UPLOAD_REPO);
    console.log({modifiedFilesInPR});
    
    await notifyDatagouvChanges(modifiedFilesInPR, pr_id);
    
  });

program.parse();