#!/usr/bin/env node
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {Datagouv, DatagouvResourceCustom} from 'datagouv-ts'
import {Datagouv as DatagouvLocal} from './Datagouv'
import { readFile, readdir } from 'fs/promises';
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
  .command('publish <path>', 'Publish all files in <path>', (yargs) => {
    return yargs
      .positional('path', {
        describe: 'Publish all files of this dir',
        type: "string",
      })
  },  async (argv_) => {
    let uploaded_files: any[] = await publishData(
        datagouvConfig.DATASET, datagouvConfig.API_BASE_URL, 
        process.env[datagouvConfig.API_KEY_VAR]!, 
        argv_.path!, Boolean(argv_["no-dry-run"]),
        Boolean(argv_.verbose)
        )
    console.log({uploaded_files: uploaded_files.map(e=> e.title)});
    }
  )
  .command('download <pattern> <out-dir>', 'Download all resources matching regexp <pattern> in <out-dir>', (yargs) => {
    return yargs
      .positional('pattern', {
        describe: 'pattern of resources title to download',
        default: ".*",
        type: "string",
      })
      .positional('out-dir', {
        describe: 'Publish all files of this dir',
        type: "string",
        default: config.OUT_DIR
      })
  },  async (argv_) => {

    //@ts-ignore
    const datagouvEnv = config.branch[branchName()].datagouv;
    
    let vvoid = await DatagouvLocal.download( argv_["pattern"], argv_['out-dir'], datagouvEnv.API_BASE_URL, datagouvEnv.DATASET, Boolean(argv_["no-dry-run"]))
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

async function publishData(dataset_id:string, api_base_url: string, api_key:string, path_: string, confirmCreate: boolean, verbose: boolean) {
  
  let files: string[] = (await readdir(path_))
  if (verbose) console.log(["[publishData] Files found in", path_, "(creating corresponding resources):", JSON.stringify(files)].join(" "));
  let createdResources: DatagouvResourceCustom[] = [];

  for (let file of files) {
    let file_fullpath = [path_, file].join("/");
    if (confirmCreate) {
      // Create datagouv resource corresponding 
      let createdResource: DatagouvResourceCustom = await Datagouv.createResourceFromFile(file_fullpath, api_base_url, dataset_id, api_key);
      createdResources.push(createdResource);
      console.log("Resource created: "+createdResource.title);
    }
    else {
      console.log("Resource created for "+file_fullpath);
    }    
  }
  console.log("Total files processed: "+files.length);
  


  return createdResources;
  

}