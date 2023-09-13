import { config } from "./config";

export class Helpers {
    static getDatasetMetadata(baseUrl: string, datasetId: string|undefined) {
        return fetch([baseUrl, 'datasets', datasetId].join('/'), {
            "method": "GET"
        })
        .then((r: any) => r.json())
    }

    static getGitPR(pr_id: number): Promise<any[]>{
        const gh_api_base_url: string= "https://api.github.com";
        const gh_user = config.GH_USER;
        const gh_repo = config.GH_REPO;

        return fetch([gh_api_base_url, "repos", gh_user, gh_repo, "pulls" , pr_id, "files"].join('/'), {
            "method": "GET",
            headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"
            }
        })
        .then(async (r: any) => {
            if (r.status != 200) {
                let res = await r.json();
                throw new Error("Error finding PR "+[gh_user, gh_repo, "pulls" , pr_id].join("/")+". Github API error message: "+JSON.stringify(res))
            }
            return r.json()})
        .then(r => {
            return r;
            
        })
    }

    static getUpdatedFilesPR(pr_id: number, starts_with: string= ""): Promise<string[]> {
        return this.getGitPR(pr_id)
            .then((r: {filename: string}[]) => {
                return r.filter((e: {filename: string}) => e.filename.startsWith(starts_with))
                    .map((e: {filename: string}) => {
                        return e.filename.split('/').pop()!;
                    })
            })
    }

    static DatagouvCreateResource(baseUrl: string, datasetId: string, title:string, description:string, url:string) {

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