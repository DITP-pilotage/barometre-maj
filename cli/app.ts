import { Command } from 'commander';
const program = new Command();
import {dlDatagouvFiles} from './dl_datagouv_files';
import { notifyDatagouvChanges } from './notify_datagouv_changes';
import { GitCommit, GitLog } from './gitlog';
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
  .argument('<commit-id>', "Commit du fichier mis à jour")
  .option('-d, --directory <path>', 'source directory')
  .action(async (commit_id:string, opts:{directory: string}) => {
    console.log({opts});
    
    let log_: {gitLog: GitCommit, updatedFiles: string[]} = GitLog.getLog(commit_id);
    
    console.log(log_);
    await notifyDatagouvChanges(log_.updatedFiles, commit_id);

    let gpr = await Helpers.getGitPR(587);
    console.log(gpr);
    
    
  });

program.parse();