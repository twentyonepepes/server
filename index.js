import cors from 'cors';
import express from 'express';
import { createServer as createHTTPServer } from 'http';
import { address } from 'ip';
import { server } from 'websocket';
import { json } from 'body-parser';

export function createServer(PORT = 80, config = {}){

    const {
        stream = null,
		docs = null,
        name = `[default-name]`,
        streams
    } = config;
    
    const HOST = process.env.HOST || address();
    const ROUTE = `${HOST}:${PORT}`;
    
    const app = new express();
    const httpServer = createHTTPServer(app);
    
    app.use(cors());
    app.use(json({limit: '1024mb'}));

    const wsServer = new server({
        
        httpServer
        
    });

    wsServer.on('request', function(request) {
        
        const { resource } = request;
        const key = resource.replace('/','');

        if (streams[key]) {

            const stream = streams[key];
            const connection = request.accept();
            stream.subscribe(t => {
        
                connection.send(JSON.stringify(t));
        
            })

        } else {
            request.reject();
        }
        
    });

	if (docs) {

		let docsObj = {};

		for (let [key, value] of Object.entries(docs)) {
			const { protocols = 'http', example = null } = (value || {});

			const docsEntry = {
				...value,
				url : {}
			};
			for (const protocol of protocols.split(",")) {

				docsEntry.url[protocol] = `${protocol}://${ROUTE}${example || key}`;
				
			}
			docsObj[key] = docsEntry;
		}
				
		app.get("/", (_req,res)=>{
			res.json(docsObj);
		})

	}

    httpServer.listen(PORT, console.info(`${name} listening : http://${ROUTE}`));

    return {
        ROUTE,
        app,
        httpServer,
        PORT,
        HOST,
        wsServer
    }
}