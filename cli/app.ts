#!/usr/bin/env node
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {Datagouv, DatagouvResourceCustom} from 'datagouv-ts'
const branchName = require('current-git-branch');
import {config} from './config'



//@ts-ignore
const datagouvConfig : any = config.branch[branchName()].datagouv;

yargs(hideBin(process.argv))
  .parserConfiguration({"boolean-negation": false})
  .command('delete <pattern>', 'Delete resource based on their title', (yargs) => {
    return yargs
      .positional('pattern', {
        describe: 'pattern of resources title to delete',
        type: "string",
      })
  },  async (argv_) => {
    let deleted_resources: DatagouvResourceCustom[] = await Datagouv.deleteResourceDatasetPattern(
        datagouvConfig.DATASET, datagouvConfig.API_BASE_URL, 
        process.env[datagouvConfig.API_KEY_VAR]!, 
        argv_.pattern!, Boolean(argv_["no-dry-run"]),
        Boolean(argv_.verbose)
        )
    console.log({deleted_resources: deleted_resources.map(e=> e.title)});
    
    }

    
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .option('no-dry-run', {
    type: 'boolean',
    default: false,
    description: 'Do not run in dry-run mode. By default, all commands run in dry-mode.'
  })
  .parse()

