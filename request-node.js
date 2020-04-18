const https = require('https');
const http = require('http');
const fs = require('fs');
var child_process = require('child_process');

const method = "GET";

const url = "https://park.fuwu178.cn/api/rest/user/me";

const headers = {
    "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
};

const body = null;

function assignToOptions(method, url, headers) {
    /(https?:)\/\/([^/:]+):?(\d+)?(.*)/.test(url);
    var options = { headers, method };
    options.protocol = RegExp.$1;
    options.hostname = RegExp.$2;
    options.port = RegExp.$3 || 443;
    options.path = RegExp.$4;
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

server.listen(9394, () => {
    console.log('服务启动(。・∀・)ノ http://127.0.0.1:9394');

    child_process.exec('start chrome http://127.0.0.1:9394/index.html');
});

// 版本一： 完成基本请求，不涉及文件（支持https、http）
// 版本二： 添加网页输入功能，显示功能
// 版本三： 添加上传文件功能

