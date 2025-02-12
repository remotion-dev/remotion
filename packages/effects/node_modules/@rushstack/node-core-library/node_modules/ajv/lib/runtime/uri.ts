import * as uri from "uri-js"

type URI = typeof uri & {code: string}
;(uri as URI).code = 'require("ajv/dist/runtime/uri").default'

export default uri as URI
