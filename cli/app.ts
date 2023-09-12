const { Command } = require('commander');
const program = new Command();
import {dlDatagouvFiles} from './dl_datagouv_files';

program
  .name('string-util')
  .description('CLI to some JavaScript string utilities')
  .version('0.8.0');

program.command('dl-datagouv')
  .description('Télécharge les fichiers actuellement présents sur datagouv')
  .option('-d, --destination <path>', 'destination directory', '.data')
  .action((opts:any, _:any) => {
    
    dlDatagouvFiles(opts.destination);
    
  });

program.parse();