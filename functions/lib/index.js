"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onListingWrite = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
const aiVision_js_1 = require("./aiVision.js");
const aiDescription_js_1 = require("./aiDescription.js");
const aiPricing_js_1 = require("./aiPricing.js");
const aiFraud_js_1 = require("./aiFraud.js");
(0, app_1.initializeApp)();
const db = (0, firestore_2.getFirestore)();
exports.onListingWrite = (0, firestore_1.onDocumentWritten)("listings/{id}", async (event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    const after = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after) === null || _b === void 0 ? void 0 : _b.data();
    if (!after)
        return;
    const id = event.params.id;
    const ref = db.collection("listings").doc(id);
    let aiTags = (_c = after.aiTags) !== null && _c !== void 0 ? _c : [];
    let aiCaption = (_d = after.aiCaption) !== null && _d !== void 0 ? _d : "";
    let aiFullDescription = (_e = after.aiFullDescription) !== null && _e !== void 0 ? _e : "";
    let aiPricing = (_f = after.aiPricing) !== null && _f !== void 0 ? _f : null;
    let fraud = (_g = after.fraud) !== null && _g !== void 0 ? _g : null;
    const firstImage = (_j = (_h = after.imageUrls) === null || _h === void 0 ? void 0 : _h[0]) !== null && _j !== void 0 ? _j : null;
    // 1) Vision AI
    if (firstImage) {
        const vision = await (0, aiVision_js_1.generateAITags)(firstImage);
        aiTags = vision.tags;
        aiCaption = vision.caption;
    }
    // 2) Full AI description
    aiFullDescription = await (0, aiDescription_js_1.generateAIDescription)({
        title: (_k = after.title) !== null && _k !== void 0 ? _k : "",
        address: (_l = after.address) !== null && _l !== void 0 ? _l : "",
        description: (_m = after.description) !== null && _m !== void 0 ? _m : "",
        tags: aiTags,
    });
    // 3) Pricing
    aiPricing = await (0, aiPricing_js_1.generateAIPricing)({
        title: (_o = after.title) !== null && _o !== void 0 ? _o : "",
        description: (_p = after.description) !== null && _p !== void 0 ? _p : aiFullDescription,
        price: Number((_q = after.price) !== null && _q !== void 0 ? _q : 0),
        beds: (_r = after.beds) !== null && _r !== void 0 ? _r : 0,
        baths: (_s = after.baths) !== null && _s !== void 0 ? _s : 0,
        sqft: (_t = after.sqft) !== null && _t !== void 0 ? _t : 0,
        zip: (_u = after.zip) !== null && _u !== void 0 ? _u : "",
    });
    // 4) Fraud detection
    const fraudText = `
${after.title}
${after.description}
${aiFullDescription}
${aiPricing === null || aiPricing === void 0 ? void 0 : aiPricing.reasoning}
    `;
    fraud = await (0, aiFraud_js_1.runFraudCheck)(fraudText);
    // 5) Write back
    await ref.set({
        aiTags,
        aiCaption,
        aiFullDescription,
        aiPricing,
        fraud,
        aiProcessedAt: new Date(),
    }, { merge: true });
    console.log(`AI pipeline completed for listing ${id}`);
});
//# sourceMappingURL=index.js.map