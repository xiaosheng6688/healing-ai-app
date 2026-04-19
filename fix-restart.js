// Fix bug: date -> today in useFreeCount
var fs = require('fs');
var path = __dirname + '/server.js';
var content = fs.readFileSync(path, 'utf8');
// Fix the bug: { date, counts: {} } -> { date: today, counts: {} }
content = content.replace(
  "counts = { date, counts: {} };",
  "counts = { date: today, counts: {} };"
);
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed! Restarting server...');

// Now restart server
var http = require('http');
var net = require('net');

// Kill port 3000
var server = net.createServer();
server.once('error', function(){});
server.once('listening', function() { server.close(); });
server.listen(3000, '127.0.0.1');

// Start new server
setTimeout(function() {
  console.log('Starting server...');
  require('./server.js');
  
  // Test immediately
  setTimeout(function() {
    var http2 = require('http');
    var body = JSON.stringify({userId:'fix_test',message:'你好'});
    var r = http2.request({hostname:'127.0.0.1',port:3000,path:'/api/chat',method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}}, function(res2) {
      var bufs = []; res2.on('data',function(c){bufs.push(c)}); res2.on('end',function(){
        var full = Buffer.concat(bufs).toString('utf8');
        try {
          var j = JSON.parse(full);
          console.log('\n=== API TEST ===');
          console.log('Status:', res2.statusCode);
          console.log('Reply:', (j.reply||'EMPTY').slice(0,60));
          console.log('isVIP:', j.isVIP, 'freeRemaining:', j.freeRemaining);
          if (j.reply && j.reply.length > 0) {
            console.log('\n✅ ALL WORKING!');
          } else {
            console.log('\n❌ Still empty reply');
            console.log('Raw:', full.slice(0,200));
          }
        } catch(e) { console.log('Parse error:', full.slice(0,200)); }
      });
    }); r.on('error',function(e){console.error('Req err:',e.message)}); r.write(body); r.end();
  }, 3000);
}, 2000);
