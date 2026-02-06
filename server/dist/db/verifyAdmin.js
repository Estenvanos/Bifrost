"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminToken = verifyAdminToken;
function verifyAdminToken(req) {
    const header = req.headers.get("authorization");
    if (!header)
        return false;
    const [type, token] = header.split(" ");
    if (type !== "Bearer")
        return false;
    return token === process.env.ADMIN_SECRET_TOKEN;
}
