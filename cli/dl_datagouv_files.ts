import {config} from './config'
const fetch = require('node-fetch')
require('dotenv').config();

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
        console.log(r.resources.map((e: any) => ({
            id: e.id,
            created_at: e.created_at,
            last_modified: e.last_modified,
            title: e.title,
            latest: e.latest,
            url: e.url,
            description: e.description,
            format: e.format
        })));
        
        console.log("Files downloaded at "+dest);
    })
}