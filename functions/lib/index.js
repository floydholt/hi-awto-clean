"use strict";
/**
 * HI-AWTO Cloud Functions
 * AI pipeline for listings: Vision tags, pricing, fraud check, full description
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processListing = exports.submitLead = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
const aiVision_js_1 = require("./aiVision.js");
const aiPricing_js_1 = require("./aiPricing.js");
const aiFraud_js_1 = require("./aiFraud.js");
const aiDescription_js_1 = require("./aiDescription.js");
var submit_lead_js_1 = require("./submit-lead.js");
Object.defineProperty(exports, "submitLead", { enumerable: true, get: function () { return submit_lead_js_1.submitLead; } });
// ---------------------------------------------------------------------------
// Firebase Admin init (ESM-friendly)
// ---------------------------------------------------------------------------
const app = (0, app_1.getApps)().length === 0 ? (0, app_1.initializeApp)() : (0, app_1.getApp)();
const db = (0, firestore_2.getFirestore)(app);
// ---------------------------------------------------------------------------
// Firestore trigger: whenever a listing is created/updated
// ---------------------------------------------------------------------------
exports.processListing = (0, firestore_1.onDocumentWritten)("listings/{listingId}", async (event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    const before = ((_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before) === null || _b === void 0 ? void 0 : _b.data()) || null;
    const after = ((_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.after) === null || _d === void 0 ? void 0 : _d.data()) || null;
    const listingId = event.params.listingId;
    if (!after) {
        console.log("Listing deleted:", listingId);
        return;
    }
    console.log("Processing listing:", listingId);
    // Try to pick a primary image
    const imageUrl = (Array.isArray(after.imageUrls) && after.imageUrls[0]) ||
        after.coverImage ||
        after.primaryImage ||
        null;
    let aiTags = [];
    let aiCaption = "";
    let aiPricing = null;
    let aiFraud = null;
    let aiFullDescription = null;
    // -----------------------------------------------------------------------
    // 1) AI VISION (Gemini) - tags + caption
    // -----------------------------------------------------------------------
    if (imageUrl) {
        try {
            console.log("Running Gemini Vision on:", imageUrl);
            const vision = await (0, aiVision_js_1.analyzeImageWithGemini)(imageUrl);
            aiTags = (_e = vision === null || vision === void 0 ? void 0 : vision.tags) !== null && _e !== void 0 ? _e : [];
            aiCaption = (_f = vision === null || vision === void 0 ? void 0 : vision.caption) !== null && _f !== void 0 ? _f : "";
            console.log("Vision result:", { aiTags, aiCaption });
        }
        catch (err) {
            console.error("Gemini Vision error:", err);
        }
    }
    // -----------------------------------------------------------------------
    // 2) AI PRICING (Gemini) - suggested price + range
    // -----------------------------------------------------------------------
    try {
        console.log("Running AI pricing…");
        aiPricing = await (0, aiPricing_js_1.generateAIPricing)({
            title: String((_g = after.title) !== null && _g !== void 0 ? _g : ""),
            description: String((_h = after.description) !== null && _h !== void 0 ? _h : ""),
            price: Number((_j = after.price) !== null && _j !== void 0 ? _j : 0),
            beds: Number((_k = after.beds) !== null && _k !== void 0 ? _k : 0),
            baths: Number((_l = after.baths) !== null && _l !== void 0 ? _l : 0),
            sqft: Number((_m = after.sqft) !== null && _m !== void 0 ? _m : 0),
            zip: String(after.zip || after.postalCode || ""),
        });
        console.log("AI pricing result:", aiPricing);
    }
    catch (err) {
        console.error("AI pricing error:", err);
    }
    // -----------------------------------------------------------------------
    // 3) AI FRAUD CHECK (Gemini)
    // -----------------------------------------------------------------------
    try {
        console.log("Running AI fraud check…");
        aiFraud = await (0, aiFraud_js_1.runFraudCheck)({
            title: String((_o = after.title) !== null && _o !== void 0 ? _o : ""),
            description: String((_p = after.description) !== null && _p !== void 0 ? _p : ""),
            price: Number((_q = after.price) !== null && _q !== void 0 ? _q : 0),
            sellerId: String((_r = after.sellerId) !== null && _r !== void 0 ? _r : ""),
            accountAge: Number((_s = after.accountAge) !== null && _s !== void 0 ? _s : 0),
            hasMultipleAccounts: Boolean((_t = after.hasMultipleAccounts) !== null && _t !== void 0 ? _t : false),
            usesStockPhotos: Boolean((_u = after.usesStockPhotos) !== null && _u !== void 0 ? _u : false),
        });
        console.log("AI fraud result:", aiFraud);
    }
    catch (err) {
        console.error("AI fraud error:", err);
    }
    // -----------------------------------------------------------------------
    // 4) AI FULL PROPERTY DESCRIPTION (Gemini)
    // -----------------------------------------------------------------------
    try {
        console.log("Generating AI full description…");
        aiFullDescription = await (0, aiDescription_js_1.generateAIDescription)({
            title: String((_v = after.title) !== null && _v !== void 0 ? _v : ""),
            tags: aiTags,
            price: Number((_w = after.price) !== null && _w !== void 0 ? _w : 0),
            beds: Number((_x = after.beds) !== null && _x !== void 0 ? _x : 0),
            baths: Number((_y = after.baths) !== null && _y !== void 0 ? _y : 0),
            sqft: Number((_z = after.sqft) !== null && _z !== void 0 ? _z : 0),
            zip: String(after.zip || after.postalCode || ""),
        });
        console.log("AI description length:", (_0 = aiFullDescription === null || aiFullDescription === void 0 ? void 0 : aiFullDescription.length) !== null && _0 !== void 0 ? _0 : 0);
    }
    catch (err) {
        console.error("AI description error:", err);
        aiFullDescription = null;
    }
    // -----------------------------------------------------------------------
    // 5) Write results back to Firestore
    //    These field names match what your React app reads:
    //    - aiTags, aiCaption, aiPricing, aiFraud, aiFullDescription
    // -----------------------------------------------------------------------
    try {
        await db.collection("listings").doc(listingId).set({
            aiTags,
            aiCaption,
            aiPricing,
            aiFraud,
            aiFullDescription,
            aiUpdatedAt: new Date().toISOString(),
        }, { merge: true });
        console.log("AI fields updated for listing:", listingId);
    }
    catch (err) {
        console.error("Failed to update listing with AI fields:", err);
    }
    return null;
});
//# sourceMappingURL=index.js.map