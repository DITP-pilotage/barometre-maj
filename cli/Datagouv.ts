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
}