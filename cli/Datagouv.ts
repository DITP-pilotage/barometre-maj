import {config} from './config'
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