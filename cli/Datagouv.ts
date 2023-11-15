import {config} from './config'
import * as https from 'https'
import * as fs from 'fs';
const branchName = require('current-git-branch');

export class Datagouv {
    static getDatasetMetadata(baseUrl: string, datasetId: string|undefined) {
        return fetch([baseUrl, 'datasets', datasetId].join('/'), {
            "method": "GET"
        })
        .then((r: any) => r.json())
    }

    static BuilderResourceUrl(filename: string): string {
        return [config.GH_RAW_BASE_URL, config.GH_USER, config.GH_REPO, branchName(), config.SOURCE_DIR_TO_UPLOAD_REPO, filename].join("/")
    }

    static createResource(baseUrl: string, datasetId: string, title:string, description:string, url:string) {

        const payload = {
                "description": description,
                "filetype": "remote",
                "format": "csv",
                "mime": "text/csv",
                "title": title,
                "type": "main",
                "url": url
        }

        return fetch([baseUrl, 'datasets', datasetId, 'resources'].join('/'), {
            "method": "POST",
            headers: {
                'Content-Type': 'application/json',
                "X-API-KEY": process.env.DEMO_API_KEY!,
            },
            body: JSON.stringify(payload)
        })
        .then((r: any) => r.json())

    }

    /**
     * Update a Datagouv resource
     * @param resource Resource to update 
     * @param payload Fields to update. Some of {description?, title?, url?}
     * @returns Datagouv response
     */
    static updateResource(resource: DatagouvResourceCustom, payload: {description?: string, title?: string, url?: string}): Promise<void>{

        //@ts-ignore
        let datagouvEnv = config.branch[branchName()].datagouv;
    
    
        return fetch([datagouvEnv.API_BASE_URL, "datasets", datagouvEnv.DATASET, "resources", resource.id].join("/"), {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                "X-API-KEY": process.env.DEMO_API_KEY!,
            },
            body: JSON.stringify(payload)
        }).then(r => r.json())
    }

    static updateResourceDescription(resource: DatagouvResourceCustom, description: string): Promise<void>{
        return this.updateResource(resource, {description});
    }

    static async download(dest: string, baseUrl: string, datasetId: string, confirmDownload: boolean=false): Promise<void> {

        //@ts-ignore
        const datagouvEnv = config.branch[branchName()].datagouv;
    
    
        return this.getDatasetMetadata(datagouvEnv.API_BASE_URL, datagouvEnv.DATASET)
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
                if (confirmDownload) await this.downloadToFile(resource.url, [dest,resource.title].join("/"))
                else console.log("[skipped] File downloaded at "+[dest,resource.title].join("/"));
            }
            console.log(mapped.length + " files downloaded at "+dest);
        })
    }

    static downloadToFile(url: string, outfile: string) {

        return new Promise((resolve, reject) => {
            //@ts-ignore
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
}

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