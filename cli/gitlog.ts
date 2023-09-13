import gitlog from "gitlog";

export class GitLog {

  // Get git log of given sha

  /**
   * Get git log of given commit
   * @param targetHash SHA of commit to retrieve
   * @returns Log info of the commit, and array of filenames of updated files in the commit
   */
  static getLog(targetHash: string): {gitLog: any, updatedFiles: string[]} {

    // Look for commit in the last N commits of the repo
    const lastCommitsToCheck: number = 10;
    // Directory of the git repo
    const gitDirectory: string = __dirname;
    
    const gitLog: any = 
      gitlog({
        repo: gitDirectory,
        number: lastCommitsToCheck,
        fields: ["subject", "authorName", "authorDate", "authorDateRel", "hash", "subject", "abbrevHash"]
      })
        .find((e:any) => e.hash == targetHash);

    if (!gitLog) throw new Error("No commit found for sha "+targetHash)
    
    let updatedFiles: string[] = gitLog.files.map((e: string) => {
      return e.split('/').pop()
    })

    return {gitLog, updatedFiles};

  }
}