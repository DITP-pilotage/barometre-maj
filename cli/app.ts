import { Command, Help } from 'commander';
const program = new Command();
import {dlDatagouvFiles} from './dl_datagouv_files';
import { notifyDatagouvChanges } from './notify_datagouv_changes';
import { Helpers } from './helpers';

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
  .option('-d, --directory <path>', 'source directory')
  .action(async (opts:{directory: string}) => {
    console.log({opts});
    
    const pr_id: number= 1;
    let gpr = await Helpers.getUpdatedFilesPR(pr_id);
    console.log(gpr);
    
    await notifyDatagouvChanges(gpr, pr_id);
    
  });

program.parse();