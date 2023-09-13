import {config} from './config'
import fetch from 'node-fetch';
import 'dotenv/config';

import { Helpers } from './helpers';


export async function notifyDatagouvChanges(files: string[], commitId: string): Promise<void> {

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
        console.log(mapped.slice(0,2));
        return mapped;
    }).then(async (mapped: any) => {
        for (let f of files) {

            let onlineFile: any = mapped.find((e:any) => e.title == f);




            if (onlineFile) console.log("File found at "+onlineFile.url)
            else console.log("No file found for "+f);
            
            
            //await dl(resource.url, [dest,resource.title].join("/"))
        }
        console.log("Files updated from ");
    })
}