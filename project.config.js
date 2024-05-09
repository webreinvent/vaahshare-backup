class ProjectConfig {
    constructor() {
        this.params = {
            env: null,
            version: null,
            debug: true,
            log_level: 'info',
            socket_url: 'http://localhost:3000',
            backend_api_url: null,
        }

    }

    //--------------------------------------------


//--------------------------------------------
    setParams() {

        this.params.env = process.env.NODE_PROJECT_ENV || 'local';

        switch (process.env.NODE_PROJECT_ENV) {
            case 'local':
                break;
            case 'pk_mac':
                this.params.backend_api_url = 'http://vaah-backend.test/api/'
                break;
        }
    }

//--------------------------------------------
    getParams() {

        this.setParams();

        console.log('params-->', this.params);

        return this.params;
    }

    //--------------------------------------------


}

export default ProjectConfig;
