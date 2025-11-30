"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var twilio_1 = require("twilio");
var mail_1 = require("@sendgrid/mail");
require("dotenv/config");
// Load env vars (make sure you set these in your local .env or shell)
var _a = process.env, TWILIO_ACCOUNT_SID = _a.TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN = _a.TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER = _a.TWILIO_FROM_NUMBER, TEST_PHONE_NUMBER = _a.TEST_PHONE_NUMBER, SENDGRID_API_KEY = _a.SENDGRID_API_KEY, SENDGRID_FROM_EMAIL = _a.SENDGRID_FROM_EMAIL, TEST_EMAIL_TO = _a.TEST_EMAIL_TO;
// --- Twilio SMS Test ---
function testTwilio() {
    return __awaiter(this, void 0, void 0, function () {
        var client, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !TEST_PHONE_NUMBER) {
                        console.error("Missing Twilio env vars");
                        return [2 /*return*/];
                    }
                    client = (0, twilio_1.default)(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
                    return [4 /*yield*/, client.messages.create({
                            body: "✅ Twilio smoke test successful!",
                            from: TWILIO_FROM_NUMBER,
                            to: TEST_PHONE_NUMBER,
                        })];
                case 1:
                    msg = _a.sent();
                    console.log("Twilio SMS sent:", msg.sid);
                    return [2 /*return*/];
            }
        });
    });
}
// --- SendGrid Email Test ---
function testSendGrid() {
    return __awaiter(this, void 0, void 0, function () {
        var resp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL || !TEST_EMAIL_TO) {
                        console.error("Missing SendGrid env vars");
                        return [2 /*return*/];
                    }
                    mail_1.default.setApiKey(SENDGRID_API_KEY);
                    return [4 /*yield*/, mail_1.default.send({
                            to: TEST_EMAIL_TO,
                            from: SENDGRID_FROM_EMAIL,
                            subject: "✅ SendGrid smoke test",
                            text: "This is a test email from HI AWTO functions.",
                        })];
                case 1:
                    resp = (_a.sent())[0];
                    console.log("SendGrid email response:", resp.statusCode);
                    return [2 /*return*/];
            }
        });
    });
}
// Run both tests
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, testTwilio()];
            case 1:
                _a.sent();
                return [4 /*yield*/, testSendGrid()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
