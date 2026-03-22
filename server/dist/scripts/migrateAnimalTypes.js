"use strict";
// server/src/scripts/migrateAnimalTypes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ranchtracker';
// Legacy status → new enum value
const STATUS_MAP = {
    'Milking': 'LACTATING',
    'milking': 'LACTATING',
    'MILKING': 'LACTATING',
    'Dry': 'DRY',
    'dry': 'DRY',
    'Calf': 'CALF',
    'calf': 'CALF',
    'Heifer': 'HEIFER',
    'heifer': 'HEIFER',
    'Sold': 'SOLD',
    'sold': 'SOLD',
    'Dead': 'DEAD',
    'dead': 'DEAD',
};
async function migrate() {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose_1.default.connect(MONGO_URI);
    console.log('✅ Connected\n');
    const collection = mongoose_1.default.connection.collection('animals');
    const total = await collection.countDocuments();
    console.log(`📊 Total animal documents: ${total}`);
    // ── 1. Set type = 'COW' on all docs missing type ──────────────────────────
    const missingType = await collection.countDocuments({
        $or: [{ type: { $exists: false } }, { type: null }, { type: '' }]
    });
    console.log(`🐄 Documents missing 'type' field: ${missingType}`);
    if (missingType > 0) {
        const r1 = await collection.updateMany({ $or: [{ type: { $exists: false } }, { type: null }, { type: '' }] }, { $set: { type: 'COW' } } // ← change to 'BUFFALO' if most are buffaloes
        );
        console.log(`   ✅ Set type='COW' on ${r1.modifiedCount} documents`);
    }
    // ── 2. Normalise legacy status values ────────────────────────────────────
    let statusFixed = 0;
    for (const [old, newVal] of Object.entries(STATUS_MAP)) {
        const r = await collection.updateMany({ status: old }, { $set: { status: newVal } });
        if (r.modifiedCount > 0) {
            console.log(`   📝 status '${old}' → '${newVal}': ${r.modifiedCount} docs`);
            statusFixed += r.modifiedCount;
        }
    }
    console.log(`✅ Status normalised on ${statusFixed} documents`);
    // ── 3. Normalise gender ───────────────────────────────────────────────────
    const gFemale = await collection.updateMany({ gender: 'Female' }, { $set: { gender: 'FEMALE' } });
    const gMale = await collection.updateMany({ gender: 'Male' }, { $set: { gender: 'MALE' } });
    console.log(`✅ Gender normalised: ${gFemale.modifiedCount + gMale.modifiedCount} documents`);
    // ── 4. Ensure tagNo is set from tagNumber where missing ───────────────────
    const noTagNo = await collection.updateMany({ $and: [
            { $or: [{ tagNo: { $exists: false } }, { tagNo: null }, { tagNo: '' }] },
            { tagNumber: { $exists: true, $nin: [null, ''] } }
        ] }, [{ $set: { tagNo: '$tagNumber' } }]);
    console.log(`✅ tagNo backfilled on ${noTagNo.modifiedCount} documents`);
    // ── 5. Final check ────────────────────────────────────────────────────────
    console.log('\n📊 Final type distribution:');
    const cows = await collection.countDocuments({ type: 'COW' });
    const buffalos = await collection.countDocuments({ type: 'BUFFALO' });
    const other = await collection.countDocuments({ type: { $nin: ['COW', 'BUFFALO'] } });
    console.log(`   🐄 COW:     ${cows}`);
    console.log(`   🐃 BUFFALO: ${buffalos}`);
    if (other > 0)
        console.log(`   ⚠ Other:   ${other} (check these manually)`);
    console.log('\n✅ Migration complete!');
    await mongoose_1.default.disconnect();
    process.exit(0);
}
migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
