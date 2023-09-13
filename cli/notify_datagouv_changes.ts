import {config} from './config'
import fetch from 'node-fetch';
import 'dotenv/config';
const branchName = require('current-git-branch');


import { Helpers } from './helpers';
import { title } from 'process';
import { url } from 'inspector';

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

function descriptionBuilder(pr_id: number): string {
    return ["pr", "::", pr_id, "::"].join("");
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
        console.log("["+resource.title+"] -- "+"Description of resource "+datagouvResponse.title+" set to "+datagouvResponse.description);
        
    })
}

function handleFileFound(resource: DatagouvResourceCustom, pr_id: number): Promise<void> {
    console.log("["+resource.title+"] -- File found at "+resource.url);

    // TODO: update datagouv resource


    let expectedDescription: string = descriptionBuilder(pr_id);

    console.log("["+resource.title+"] -- "+"This file is referenced in the PR so the description is being updated...");
    return updateDescription(resource, expectedDescription);

}

function handleFileNotFound(filename: string, pr_id: number) {
    console.log("["+filename+"] -- "+"No file found for "+filename);
    // TODO create datagouv resource
    console.log("TODO: Create resource datagouv");

    return Helpers.DatagouvCreateResource(
        // @ts-ignore
        config.branch[branchName()].datagouv.API_BASE_URL,
        //@ts-ignore
        config.branch[branchName()].datagouv.DATASET,
        filename,
        descriptionBuilder(pr_id),
        [config.GH_RAW_BASE_URL, config.GH_USER, config.GH_REPO, branchName(), config.SOURCE_DIR_TO_UPLOAD_REPO, filename].join("/")
        )
    .then((datagouvResourceCreated: DatagouvResourceCustom) => {
        let datagouvResourceCreatedClean: DatagouvResourceCustom= {
            id: datagouvResourceCreated.id,
            title: datagouvResourceCreated.title,
            description: datagouvResourceCreated.description,
            url: datagouvResourceCreated.url,
            format: datagouvResourceCreated.format,
            created_at: datagouvResourceCreated.created_at,
            last_modified: datagouvResourceCreated.last_modified,
            latest: datagouvResourceCreated.latest
        }
        console.log("["+filename+"] -- "+"Resource created: "+JSON.stringify(datagouvResourceCreatedClean));

    })
    
}

export async function notifyDatagouvChanges(files: string[], pr_id: number): Promise<void> {

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
        //console.log(mapped.slice(0,2));
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