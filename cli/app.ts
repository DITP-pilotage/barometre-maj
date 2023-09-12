const { Command } = require('commander');
const program = new Command();
import {dlDatagouvFiles} from './dl_datagouv_files';

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

program.parse();