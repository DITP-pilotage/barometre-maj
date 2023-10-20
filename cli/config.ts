import 'dotenv/config';

export const config = {
    OUT_DIR: './out',
    SOURCE_DIR_TO_UPLOAD_RELATIVE: '../datagouv_3_updated',
    SOURCE_DIR_TO_UPLOAD_REPO: 'data/datagouv_3_updated',
    GH_BASE_URL: "https://github.com",
    GH_RAW_BASE_URL: "https://raw.githubusercontent.com",
    GH_REPO: "barometre-maj",
    GH_USER: "DITP-pilotage",
    branch: {
        "main": {
            datagouv: {API_BASE_URL: "https://www.data.gouv.fr/api/1", DATASET: process.env.DATASET_PROD, API_KEY_VAR: "PROD_API_KEY"}
        },
        "prod": {
            datagouv: {API_BASE_URL: "https://www.data.gouv.fr/api/1", DATASET: process.env.DATASET_PROD, API_KEY_VAR: "PROD_API_KEY"}
        },
        "pre-prod": {
            datagouv: {API_BASE_URL: "https://demo.data.gouv.fr/api/1", DATASET: process.env.DATASET_DEMO, API_KEY_VAR: "DEMO_API_KEY"}
        },
        "test": {
            datagouv: {API_BASE_URL: "https://demo.data.gouv.fr/api/1", DATASET: process.env.DATASET_TEST, API_KEY_VAR: "DEMO_API_KEY"}
        }
    }
}
