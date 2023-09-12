import { rejects } from 'assert';
import {config} from './config'
const fetch = require('node-fetch')
require('dotenv').config();

const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');

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

export async function dlDatagouvFiles(dest: string): Promise<void> {

    const datagouvEnv = config.datagouv.demo;
    config.datagouv.demo.API_BASE_URL

    console.log([datagouvEnv.API_BASE_URL, 'datasets', process.env.DATASET_DEMO].join('/') );
    
    return fetch([datagouvEnv.API_BASE_URL, 'datasets', process.env.DATASET_DEMO].join('/'), {
        "method": "GET"
    })
    .then((r: any) => r.json())
    .then((r: any) => {
        console.log(r);
        let mapped= r.resources.map((e: any) => ({
            id: e.id,
            created_at: e.created_at,
            last_modified: e.last_modified,
            title: e.title,
            latest: e.latest,
            url: e.url,
            description: e.description,
            format: e.format
        }));
        
        return mapped;
    }).then(async (mapped: any) => {
        for (let resource of mapped) {
            await dl(resource.url, [dest,resource.title].join("/"))
        }
        console.log("Files downloaded at "+dest);
    })
}