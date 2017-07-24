/**
 * The generating rules refer to https://github.com/nuysoft/Mock/wiki/Syntax-Specification
 */
module.exports = {
    "/test": {
        "list|10-20": [
            {
                "email": "@email",
                "name": "@first @last",
                "id|+1": 1
            }
        ],
        "message": "success",
        "code": 200
    }
}