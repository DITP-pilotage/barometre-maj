export class Helpers {
    static getDatasetMetadata(baseUrl: string, datasetId: string|undefined) {
        return fetch([baseUrl, 'datasets', datasetId].join('/'), {
            "method": "GET"
        })
        .then((r: any) => r.json())
    }
}