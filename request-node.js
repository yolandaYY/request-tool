const https = require('https');
const http = require('http');

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

function handleResponse(res) {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`=================================`);
    console.log(`响应头: ${JSON.stringify(res.headers, null, 2)}`);
    console.log(`=================================`);
    res.setEncoding('utf8');
    var responseBody = "";
    res.on('data', (chunk) => {
        responseBody += chunk;
    });
    res.on('end', () => {
        console.log(`响应主体: ${JSON.stringify(JSON.parse(responseBody), null, 2)}`);
        console.log(`=================================`);
    });
}

function ajax(method, url, headers, body) {
    var options = assignToOptions(method, url, headers);
    var req = null;
    if (options.protocol == "https:") {
        req = https.request(options, handleResponse);
    } else {
        req = http.request(options, handleResponse);
    }

    req.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`);
    });

    if (body) req.write();
    req.end();
}

ajax(method, url, headers, body);

// 版本一： 完成基本请求，不涉及文件（支持https、http）
// 版本二： 添加网页输入功能，显示功能
// 版本三： 添加上传文件功能

