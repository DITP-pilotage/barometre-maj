export const config = {
    datagouv : {
        demo: {
            API_BASE_URL: "https://demo.data.gouv.fr/api/1"
        },
        prod: {
            API_BASE_URL: "https://www.data.gouv.fr/api/1"
        },
        test: {
            API_BASE_URL: "https://demo.data.gouv.fr/api/1"
        }
    },
    OUT_DIR: './out',
    SOURCE_DIR_TO_UPLOAD: '../updated_datagouv'
}