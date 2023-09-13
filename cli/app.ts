import { Command } from 'commander';
const program = new Command();
import {dlDatagouvFiles} from './dl_datagouv_files';
import { notifyDatagouvChanges } from './notify_datagouv_changes';
import { GitLog } from './gitlog';

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
  .argument('<commit-id>', "Commit du fichier mis à jour")
  .option('-d, --directory <path>', 'source directory')
  .action(async (commit_id:string, opts:{directory: string}) => {
    console.log({opts});
    
    //await pushDatagouvFiles(opts.directory, commit_id);
    let l=GitLog.getLog(commit_id);
    console.log(l);
    
  });

program.parse();