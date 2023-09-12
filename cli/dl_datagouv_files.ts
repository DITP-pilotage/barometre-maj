import {config} from './config'
import fetch from 'node-fetch';
import 'dotenv/config';

import * as https from 'https'
import * as fs from 'fs'

function dl(url: string, outfile: string) {

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

export async function dlDatagouvFiles(dest: string= config.OUT_DIR): Promise<void> {

    const datagouvEnv = config.datagouv.demo;
    config.datagouv.demo.API_BASE_URL

    return fetch([datagouvEnv.API_BASE_URL, 'datasets', process.env.DATASET_DEMO].join('/'), {
        "method": "GET"
    })
    .then((r: any) => r.json())
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
            await dl(resource.url, [dest,resource.title].join("/"))
        }
        console.log("Files downloaded at "+dest);
    })
}