import 'dotenv/config';

export const config = {
    OUT_DIR: './out',
    SOURCE_DIR_TO_UPLOAD_RELATIVE: '../updated_datagouv',
    SOURCE_DIR_TO_UPLOAD_REPO: 'data/updated_datagouv',
    branch: {
        "main": {
            datagouv: {API_BASE_URL: "https://www.data.gouv.fr/api/1", DATASET: process.env.DATASET_PROD}
        },
        "prod": {
            datagouv: {API_BASE_URL: "https://www.data.gouv.fr/api/1", DATASET: process.env.DATASET_PROD}
        },
        "pre-prod": {
            datagouv: {API_BASE_URL: "https://demo.data.gouv.fr/api/1", DATASET: process.env.DATASET_DEMO}
        },
        "test": {
            datagouv: {API_BASE_URL: "https://demo.data.gouv.fr/api/1", DATASET: process.env.DATASET_TEST}
        }
    }
}
