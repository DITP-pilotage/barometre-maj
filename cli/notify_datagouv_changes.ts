import {config} from './config'
import fetch from 'node-fetch';
import 'dotenv/config';

import { Helpers } from './helpers';

export type DatagouvResourceCustom = {
    id: string,
    created_at: string,
    last_modified: string,
    title: string,
    latest: string,
    url: string,
    description: string,
    format: string
}

function handleFileFound(resource: DatagouvResourceCustom, commid_id: string) {
    console.log("File found at "+resource.url)
    // TODO: update datagouv resource
}

function handleFileNotFound(filename: string, commid_id: string) {
    console.log("No file found for "+filename);
    // TODO create datagouv resource
}

export async function notifyDatagouvChanges(files: string[], commitId: string): Promise<void> {

    const datagouvEnv = config.datagouv.test;

    
    return Helpers.getDatasetMetadata(datagouvEnv.API_BASE_URL, process.env.DATASET_TEST)
        .then((r: any) => {
            
        let mapped : DatagouvResourceCustom[] = r.resources.map((e: any) => ({
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
    }).then(async (mapped: DatagouvResourceCustom[]) => {
        for (let f of files) {

            let foundFile: DatagouvResourceCustom|undefined = 
                mapped.find((e:DatagouvResourceCustom) => e.title == f);

            if (foundFile) {
                handleFileFound(foundFile, commitId)
            } else {
                handleFileNotFound(f, commitId)
            }

        }
        console.log("Files updated from ");
    })
}