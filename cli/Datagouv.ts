export class Datagouv {
    static getDatasetMetadata(baseUrl: string, datasetId: string|undefined) {
        return fetch([baseUrl, 'datasets', datasetId].join('/'), {
            "method": "GET"
        })
        .then((r: any) => r.json())
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

    static updateDescription(resource: DatagouvResourceCustom, description: string): Promise<void>{

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