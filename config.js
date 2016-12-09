/*
module.export object specific to node.js, makes the 
following variables/functions available for import in 
other files
*/
module.exports = {
	"database": "mongodb://root:abc123@ds115798.mlab.com:15798/userstory",
	"port": process.env.PORT || 3000,
	"secretKey": "Key1234"
}