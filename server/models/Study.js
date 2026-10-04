import mongoose from 'mongoose';

const studySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            default: '',
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        branch: {
            type: String,
            default: 'CSE',
        },
        year: {
            type: String,
            default: '1st Year',
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        contentType: {
            type: String,
            default: 'Notes',
        },
        semester: {
            type: String,
            default: 'Semester 1',
        },
        unit: {
            type: String,
            default: '',
        },
        fileUrl: {
            type: String,
            required: [true, 'Document / file is required'],
        },
        fileName: {
            type: String,
            default: 'document.pdf',
        },
        fileSize: {
            type: String,
            default: '1 MB',
        },
        fileType: {
            type: String,
            default: 'application/pdf',
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        uploadedByName: {
            type: String,
            default: 'Verified Student',
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        downloadsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

studySchema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
        delete ret.__v;
        return ret;
    },
});

const Study = mongoose.model('Study', studySchema);
export default Study;
