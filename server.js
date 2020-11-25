const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');

const dataPath = './data.json';
const host = 'localhost';
const port = 3000;
const data = fs.readFileSync(dataPath);

let projects = JSON.parse(data);
let lastIndex = projects.length == 0 ? 0 : projects[projects.length - 1].id;

const server = http.createServer((req, res) => {
    const urlParse = url.parse(req.url, true);
    const header = { 'Content-Type': 'application/json' };

    if(urlParse.pathname == '/projects' && req.method == 'GET') {
        res.writeHead(200, header);
        res.end(JSON.stringify(projects));
    }

    if(urlParse.pathname == '/projects' && req.method == 'POST') {
        req.on('data', data => {
            const jsonData = JSON.parse(data);
            const title = jsonData.title;
            if(title) {
                projects.push({ id: ++lastIndex, title: title , tasks: [] });
                fs.writeFile(dataPath, JSON.stringify(projects), (err) => {
                    if(err) {
                        res.writeHead(500, header);
                        res.end('Could not save data');
                    } else {
                        res.writeHead(200, header);
                        res.end(JSON.stringify(projects));
                    }
                });
            } else {
                res.writeHead(400, header);
                res.end('Bad Request');
            }
        });
    }

    if(urlParse.pathname == '/projects/tasks' && req.method == 'POST') {
        req.on('data', data => {
            const search = urlParse.search;
            if(search) {
                const [, query] = search.split('?');
                const id = querystring.parse(query).id;
                if(id) {
                    const jsonData = JSON.parse(data);
                    const task = jsonData.task;
                    if(task) {
                        projects.forEach((project, index) => {
                            if(project.id == id)
                                projects[index].tasks.push(task);
                        });
                        fs.writeFile(dataPath, JSON.stringify(projects), (err) => {
                            if(err) {
                                res.writeHead(500, header);
                                res.end('Could not save data');
                            } else {
                                res.writeHead(200, header);
                                res.end(JSON.stringify(projects));
                            }
                        });
                    } else {
                        res.writeHead(400, header);
                        res.end('Bad Request');
                    }
                } else {
                    res.writeHead(400, header);
                    res.end('Bad Request');
                }
            } else {
                res.writeHead(400, header);
                res.end('Bad request');
            }
        });
    }

    if(urlParse.pathname == '/projects' && req.method == 'DELETE') {
        const search = urlParse.search;
        if(search) {
            const [, query] = search.split('?');
            const id = querystring.parse(query).id;
            projects = projects.filter(project => project.id != id);

            fs.writeFile(dataPath, JSON.stringify(projects), (err) => {
                if(err) {
                    res.writeHead(500, header);
                    res.end('Could not save data');
                } else {
                    res.writeHead(200, header);
                    res.end(JSON.stringify(projects));
                }
            });
        } else {
            res.writeHead(400, header);
            res.end('Bad request');
        }
    }

    if(urlParse.pathname == '/projects' && req.method == 'PUT') {
        req.on('data', data => {
            const search = urlParse.search;
            if(search) {
                const [, query] = search.split('?');
                const id = querystring.parse(query).id;
                if(id) {
                    const jsonData = JSON.parse(data);
                    const title = jsonData.title;
                    if(title) {
                        projects.forEach((project, index) => {
                            if(project.id == id)
                                projects[index].title = title;
                        });
                        fs.writeFile(dataPath, JSON.stringify(projects), (err) => {
                            if(err) {
                                res.writeHead(500, header);
                                res.end('Could not save data');
                            } else {
                                res.writeHead(200, header);
                                res.end(JSON.stringify(projects));
                            }
                        });
                    } else {
                        res.writeHead(400, header);
                        res.end('Bad Request');
                    }
                } else {
                    res.writeHead(400, header);
                    res.end('Bad Request');
                }
            } else {
                res.writeHead(400, header);
                res.end('Bad request');
            }
        });
    }
});

server.listen(port, host, () => {
    console.log('Server running at http://' + host + ':' + port + '/');
});