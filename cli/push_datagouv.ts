import {config} from './config'
import fetch from 'node-fetch';
import 'dotenv/config';

import * as https from 'https'
import * as fs from 'fs'
import { Helpers } from './helpers';

function upload(url: string, outfile: string) {

    return new Promise((resolve, reject) => {

        const file = fs.createWriteStream(outfile);
        https.get(url, function(response: any) {
           response.pipe(file);
        
           // after download completed close filestream
           file.on("finish", () => {
               file.close();
               console.log("File downloaded at "+outfile);
               resolve(outfile);
           });
        });
    })
    
}

export async function pushDatagouvFiles(source: string= config.OUT_DIR, commitId: string): Promise<void> {

    const datagouvEnv = config.datagouv.test;

    
    return Helpers.getDatasetMetadata(datagouvEnv.API_BASE_URL, process.env.DATASET_TEST)
        .then((r: any) => {
        let mapped : any[] = r.resources.map((e: any) => ({
            id: e.id,
            created_at: e.created_at,
            last_modified: e.last_modified,
            title: e.title,
            latest: e.latest,
            url: e.url,
            description: e.description,
            format: e.format
        }));
        console.log(mapped.slice(1,3));
        return mapped;
    }).then(async (mapped: any) => {
        for (let resource of mapped) {
            //await dl(resource.url, [dest,resource.title].join("/"))
        }
        console.log("Files uploaded from "+source);
    })
}