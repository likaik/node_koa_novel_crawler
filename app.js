const Koa = require('koa2'),
	Router = require('koa-router'),
	cheerio = require('cheerio'),
	superagent = require('superagent')
let app = new Koa(),
	router = new Router();
let fs = require("fs");


//下一章的id或class类
let nextYe ='.next';
//保存文件的路径名称
let filePath ='xs.txt';
//定义爬取地址
let url = `https://www.luoqiuzw.com`;


router.get('/', async (ctx, next) => {
	//开始爬取的章节
	getData(url + '/book/92356/38789968.html');
	ctx.body = "已开始爬取....."
})

function setFile(text) {
	return new Promise((resolve, reject) => {
		// 把爬取的文章添加到文本后
		fs.appendFile(filePath, text, function(err) {
			if (err) {
				reject(err)
			} else {
				resolve();
			}
		});
	})
}

//处理节点结构,获取节点内的文章数据
//本方法要根据爬取的网站的返回格式处理
function blChild(eleChild) {
	let strs = '';
	if (eleChild.length > 0) {
		for (let i = 0; i < eleChild.length; i++) {
			if (eleChild[i].type == "text") {
				strs += eleChild[i].data.trim();
			}
		}
		return strs;
	}
}

//递归请求方法
function getData(urlPath) {
	console.log(urlPath)
	superagent.get(urlPath).buffer(true).then(
		(sres) => {
			if (sres) {
				$ = cheerio.load(sres.text, {
					decodeEntities: false
				}); //用cheerio解析页面数据
				let yeStr = '';
				//获取当前章节目录名称
				$('.bookname h1').each((ind, ele) => {
					if (ele.name == 'h1') {
						console.log(ele.children[0].data)
						yeStr += '\r\n\r\n' + ele.children[0].data + '\r\n';
					}
				})
				$("#content").each((ind, ele) => {
					let eleChild = ele.children;
					yeStr += blChild(eleChild);
				})
				//保存方法
				setFile(yeStr).then(() => {
					//递归调用,根据返回页面的"下一章"获取下一章文件的路径
					getData(url + $(nextYe)[0].attribs.href)
				}).catch(() => {
					getData(urlPath)
				});
			}
		}).catch((err) => {
		console.log('err')
		console.log(err)
		if (err) {
			console.log('err')
			getData(urlPath)
		}
	});

}
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
	console.log('[服务已开启,访问地址为：] http://127.0.0.1:3000/');
});
