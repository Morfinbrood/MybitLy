# MybitLy

start redis server:     
   sudo service redis-server start

test redis server: 
   redis-cli
   ping

Start server node app.js

use http://127.0.0.1:7000


endpoints:
GET http://127.0.0.1:7000/   -> homepage with User SessionID


GET http://127.0.0.1:7000/*anySubPart*   -> Try to find in redis cash and db redirect rule for it
Example: http://127.0.0.1:7000/aaaa


PUT http://127.0.0.1:7000/api/addlink'   -> with redirect  and  subPart querries
Example: http://127.0.0.1:7000/addlink?redirect=ya.ru&subPart=a2