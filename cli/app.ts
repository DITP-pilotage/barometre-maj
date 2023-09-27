#!/usr/bin/env node
import yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {Datagouv} from 'datagouv-ts'

const argss =yargs(hideBin(process.argv))
  .command('delete <pattern>', 'Delete resource based on their title', (yargs) => {
    return yargs
      .positional('pattern', {
        describe: 'pattern of resorces title to delete',
        type: "string",
      })
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .argv

console.log(argss)

