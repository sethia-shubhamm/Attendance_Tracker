const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subject name is required'],
        trim: true,
        unique: true
    },
    code: {
        type: String,
        required: [true, 'Subject code is required'],
        trim: true,
        unique: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Teacher reference is required']
    },
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: String,
        endTime: String
    }],
    totalClasses: {
        type: Number,
        default: 0
    },
    minimumAttendance: {
        type: Number,
        default: 75,
        min: [0, 'Minimum attendance cannot be negative'],
        max: [100, 'Minimum attendance cannot exceed 100']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual for calculating attendance percentage
subjectSchema.virtual('attendancePercentage').get(function() {
    if (this.totalClasses === 0) return 0;
    return (this.presentClasses / this.totalClasses) * 100;
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject; 