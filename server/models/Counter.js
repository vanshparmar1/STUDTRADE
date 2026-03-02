import mongoose from 'mongoose';

/**
 * Counter — stores auto-increment sequences for any collection.
 * Usage:  Counter.findOneAndUpdate({ _id: 'studtradeID' }, { $inc: { seq: 1 } }, ...)
 */
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

export default Counter;
