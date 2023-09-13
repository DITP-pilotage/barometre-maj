export class Helpers {
    static getDatasetMetadata(baseUrl: string, datasetId: string|undefined) {
        return fetch([baseUrl, 'datasets', datasetId].join('/'), {
            "method": "GET"
        })
        .then((r: any) => r.json())
    }

    static getGitPR(pr_id: number): Promise<any>{
        const gh_api_base_url: string= "https://api.github.com";
        const gh_user = "DITP-pilotage";
        const gh_repo = "barometre-maj";

        return fetch([gh_api_base_url, "repos", gh_user, gh_repo, "pulls" , pr_id, "files"].join('/'), {
            "method": "GET",
            headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"
            }
        })
        .then((r: any) => r.json())
    }
}