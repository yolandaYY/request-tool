const https = require('https');
const http = require('http');
const fs = require('fs');
var child_process = require('child_process');

function assignToOptions(method, url, headers) {
    /(https?:)\/\/([^/:]+):?(\d+)?(.*)/.test(url);
    var options = { headers, method };
    options.protocol = RegExp.$1;
    options.hostname = RegExp.$2;
    options.port = RegExp.$3 || 443;
    options.path = RegExp.$4;
    options.rejectUnauthorized = false;
    console.log(options);
    return options;
}

function handleResponse(sendResponse, res) {
    var response = { headers: {}, body: {} };
    response.headers.status = res.statusCode;
    Object.assign(response.headers, res.headers);
    res.setEncoding('utf8');
    var responseBody = "";
    res.on('data', (chunk) => {
        responseBody += chunk;
    });
    res.on('end', () => {
        response.body = responseBody;
        if ((/json$/i).test(res.headers["content-type"])) {
            response.body = JSON.parse(responseBody);
        }
        sendResponse(JSON.stringify(response));
    });

}

function ajax(method, url, headers, body, sendResponse) {
    var options = assignToOptions(method, url, headers);
    var req = null;
    if (options.protocol == "https:") {
        req = https.request(options, handleResponse.bind(this, sendResponse));
    } else {
        req = http.request(options, handleResponse.bind(this, sendResponse));
    }

    req.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`);
    });

    if (body) req.write(body);
    req.end();
}

function startServer(_port) {
    var port = _port || parseInt(process.argv[2] || 9394);

    var server = http.createServer(function (req, res) {
        switch (req.url) {
            case "/index.html":
                var homepage = fs.readFileSync(__dirname + '/index.html').toString();
                res.end(homepage);
                break;
            case "/api":
                var reqBuffer = "";
                req.on("data", (chunk) => {
                    reqBuffer += chunk;
                })
                req.on("end", () => {
                    var reqData = JSON.parse(reqBuffer);
                    ajax(reqData.method, reqData.url, JSON.parse(reqData.headers), reqData.body,
                        (data) => {
                            res.end(data);
                        });
                })
                break;
        }
    });

    server.listen(port, () => {
        console.log('服务启动(。・∀・)ノ http://127.0.0.1:' + port);
        child_process.exec(`start chrome http://127.0.0.1:${port}/index.html`);
    });

    server.on("error", err => {
        server.close();
        if (err.code === "EADDRINUSE") {
            process.stdout.write(`端口 ${err.port} 已被占用，是否切换端口？(y/n)`);
            process.stdin.on('data', (input) => {
                input = input.toString().trim();
                if (input.startsWith("y")) {
                    startServer(Math.floor(Math.random()*10000 + 5000));
                } else {
                    process.exit(1);
                }
            });
        }
    });
}

startServer();

// 版本一： 完成基本请求，不涉及文件（支持https、http）
// 版本二： 添加网页输入功能，显示功能
// 版本三： 添加上传文件功能

// process.argv 

