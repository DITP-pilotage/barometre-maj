import {config} from './config'
import fetch from 'node-fetch';
import 'dotenv/config';
const branchName = require('current-git-branch');


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

function descriptionBuilder(commid_id: string): string {
    return ["pr", "::", commid_id].join("");
}

function updateDescription(resource: DatagouvResourceCustom, description: string): Promise<void>{

    //@ts-ignore
    let datagouvEnv = config.branch[branchName()].datagouv;


    return fetch([datagouvEnv.API_BASE_URL, "datasets", datagouvEnv.DATASET, "resources", resource.id].join("/"), {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            "X-API-KEY": process.env.DEMO_API_KEY!,
        },
        body: JSON.stringify({"description": description})
    }).then(r => r.json())
    .then((datagouvResponse: any) => {
        //console.log(datagouvResponse);
        console.log("["+resource.title+"] -- "+"New description of resource "+datagouvResponse.title+" set to "+datagouvResponse.description);
        
    })
}

function handleFileFound(resource: DatagouvResourceCustom, pr_id: string): Promise<void> {
    console.log("["+resource.title+"] -- File found at"+resource.url);

    // TODO: update datagouv resource


    let expectedDescription: string = descriptionBuilder(pr_id);

    if ((resource.description||"").includes(expectedDescription)) {
        console.log("["+resource.title+"] -- "+"The version of the resource "+resource.title+" is already sync with this commit! Nothing happens");
        return Promise.resolve();
    } else {
        console.log("["+resource.title+"] -- "+"The commit referenced in description of resource "+resource.title+" is different from this commit. Description is being updated...");
        return updateDescription(resource, expectedDescription);
    }

}

function handleFileNotFound(filename: string, pr_id: string) {
    console.log("["+filename+"] -- "+"No file found for "+filename);
    // TODO create datagouv resource
    console.log("TODO: Create resource datagouv");
    
}

export async function notifyDatagouvChanges(files: string[], pr_id: string): Promise<void> {

    //@ts-ignore
    let datagouvEnv = config.branch[branchName()].datagouv;

    
    return Helpers.getDatasetMetadata(datagouvEnv.API_BASE_URL, datagouvEnv.DATASET)
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
            console.log("["+f+"] -- Start processing"+"...");
            
            let foundFile: DatagouvResourceCustom|undefined = 
                mapped.find((e:DatagouvResourceCustom) => e.title == f);

            if (foundFile) {
                await handleFileFound(foundFile, pr_id)
            } else {
                await handleFileNotFound(f, pr_id)
            }

        }
        console.log("Files updated: ", JSON.stringify(files));
    })
}