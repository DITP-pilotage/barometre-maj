import {config} from './config'
import fetch from 'node-fetch';
import 'dotenv/config';
const branchName = require('current-git-branch');
import { Datagouv, DatagouvResourceCustom } from './Datagouv';



function descriptionBuilder(pr_id: number): string {
    return ["pr", "::", pr_id, "::"].join("");
}



function handleFileFound(resource: DatagouvResourceCustom, pr_id: number): Promise<void> {
    console.log("["+resource.title+"] -- File found at "+resource.url);

    let updatePayload: any = {};


    console.log("["+resource.title+"] -- "+"This file is referenced in the PR so the description is being updated...");
    let expectedDescription: string = descriptionBuilder(pr_id);
    updatePayload.description = expectedDescription;

    let expectedUrl: string = Datagouv.BuilderResourceUrl(resource.title);

    if (resource.url != expectedUrl) {
        console.warn("["+resource.title+"] -- "+"Url of resource is incorrect so the url is being updated... Current url: "+resource.url);
        updatePayload.url = expectedUrl;
    }
    return Datagouv.updateResource(resource, updatePayload)
        .then((datagouvResponse: any) => {
            //console.log(datagouvResponse);
            console.log("["+resource.title+"] -- "+"Description of resource "+datagouvResponse.title+" set to "+datagouvResponse.description);
            if (resource.url != expectedUrl) {
                console.log("["+resource.title+"] -- "+"Url of resource "+datagouvResponse.title+" set to "+datagouvResponse.url);
            }
        })

}

function handleFileNotFound(filename: string, pr_id: number) {
    console.log("["+filename+"] -- "+"No file found for "+filename);

    return Datagouv.createResource(
        // @ts-ignore
        config.branch[branchName()].datagouv.API_BASE_URL,
        //@ts-ignore
        config.branch[branchName()].datagouv.DATASET,
        filename,
        descriptionBuilder(pr_id),
        Datagouv.BuilderResourceUrl(filename)
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

    
    return Datagouv.getDatasetMetadata(datagouvEnv.API_BASE_URL, datagouvEnv.DATASET)
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