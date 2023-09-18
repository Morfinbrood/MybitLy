# MybitLy

start redis server: sudo service redis-server start

Start server node app.js: node src/server.js

use http://127.0.0.1:7000

endpoints:
GET http://127.0.0.1:7000/   -> homepage with User SessionID


GET http://127.0.0.1:7000/*anySubPart*   -> Try to find in redis cash and db redirect rule for it
Example: http://127.0.0.1:7000/aaaa


PUT http://127.0.0.1:7000/api/addlink'   -> with redirect  and  subPart querries
Example: http://127.0.0.1:7000/addlink?redirect=ya.ru&subPart=a2


GET http://127.0.0.1:7000/api/getUserLinks'   ->  return all link for this User by his session


DB: we have 2 collections
"links" with objects 
{"_id":"anySubPasrt",
"redirect":"ya.ru",
"createdAt": {"$date":{"$numberLong":"1695022925230"}}
}  


collection:
"user_session_links" 
{"_id":"AnyRandomUserSessionID",    
"createdAt":{"$date":{"$numberLong":"1695022925335"}},
"links":[{"$ref":"links","$id":"aaa"},{"$ref":"links","$id":"bbb"},{"$ref":"links","$id":"ccc"}]}

All documents will be autodeleted after 300 sec


redisCash will be atodeleted also after 300 sec

UserSession Expired also after 300 sec