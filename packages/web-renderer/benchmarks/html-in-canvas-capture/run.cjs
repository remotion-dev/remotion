const fs = require('fs'),
	http = require('http'),
	path = require('path'),
	{execFile} = require('child_process'),
	{promisify} = require('util');
const electron = require('electron');
const dir = __dirname;
(async () => {
	const server = http.createServer((req, res) => {
		const url = req.url.split('?')[0];
		let file;
		if (url.startsWith('/fixtures/')) file = dir + url;
		else if (url.endsWith('.js')) file = dir + url;
		else {
			res.end(
				'<html><body><script type="module" src="' +
					url +
					'.js"></script></body></html>',
			);
			return;
		}
		const size = fs.statSync(file).size;
		res.setHeader(
			'Content-Type',
			file.endsWith('.js')
				? 'text/javascript'
				: file.endsWith('mp4')
					? 'video/mp4'
					: 'audio/wav',
		);
		const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
		if (range) {
			const start = +range[1],
				end = range[2] ? Math.min(+range[2], size - 1) : size - 1;
			res.writeHead(206, {
				'Content-Range': `bytes ${start}-${end}/${size}`,
				'Content-Length': end - start + 1,
			});
			fs.createReadStream(file, {start, end}).pipe(res);
		} else {
			res.setHeader('Content-Length', size);
			fs.createReadStream(file).pipe(res);
		}
	});
	await new Promise((r) => server.listen(0, '127.0.0.1', r));
	const port = server.address().port;
	fs.writeFileSync(
		dir + '/electron.cjs',
		`const {app,BrowserWindow}=require('electron');const fs=require('fs'),os=require('os'),path=require('path');app.setPath('userData',path.join(os.tmpdir(),'remotion-capture-review-'+process.pid));for(const [name,value] of [['use-angle','metal'],['enable-features','CanvasDrawElement,CanvasDrawElementInSubtree'],['enable-blink-features','CanvasDrawElement,CanvasDrawElementInSubtree']])app.commandLine.appendSwitch(name,value);app.on('window-all-closed',()=>{});let w;app.whenReady().then(async()=>{app.dock?.hide();const results=[];let environment;const modes=${JSON.stringify((process.env.MODES || 'baseline,persistent,persistent-overlap,worker').split(','))};for(let round=-1;round<${Number(process.env.ROUNDS || 4)};round++){const order=round<0?modes:modes.slice(round%modes.length).concat(modes.slice(0,round%modes.length));for(const mode of order){w=new BrowserWindow({show:false,width:1920,height:1080,webPreferences:{contextIsolation:true,nodeIntegration:false,backgroundThrottling:false}});await w.loadURL('http://127.0.0.1:${port}/'+mode);environment??=await w.webContents.executeJavaScript('window.renderProbe.environment()');const r=await w.webContents.executeJavaScript('window.renderProbe.run('+JSON.stringify({scene:'dual',htmlCanvas:true,frames:${Number(process.env.FRAMES || 1800)},sourceName:'source-60s.mp4',secondName:'second-60s.mp4'})+')');if(r.errors.length)throw Error(JSON.stringify(r.errors));results.push({...r,mode,round});fs.writeFileSync(${JSON.stringify(dir)}+'/comparison.json',JSON.stringify({environment,complete:false,results},null,2));console.log(mode,round,(r.total/1000).toFixed(3),'seconds',r.count,'frames',r.workerFrames,'worker frames',JSON.stringify(r.phases));w.destroy()}}fs.writeFileSync(${JSON.stringify(dir)}+'/comparison.json',JSON.stringify({environment,complete:true,results},null,2));app.quit()}).catch(e=>{console.error(e);w?.destroy();app.exit(1)});`,
	);
	const child = execFile(electron, [dir + '/electron.cjs'], {
		timeout: 900000,
		maxBuffer: 1048576,
	});
	child.stdout.on('data', (x) => process.stdout.write(x));
	child.stderr.on('data', (x) => process.stderr.write(x));
	try {
		await new Promise((res, rej) =>
			child.on('exit', (code) =>
				code === 0 ? res() : rej(Error('Electron exit ' + code)),
			),
		);
	} finally {
		server.close();
	}
})().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
