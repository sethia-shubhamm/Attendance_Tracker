const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    subjects: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        totalClasses: {
            type: Number,
            default: 0
        },
        presentClasses: {
            type: Number,
            default: 0
        },
        absentClasses: {
            type: Number,
            default: 0
        },
        cancelledClasses: {
            type: Number,
            default: 0
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Method to calculate attendance percentage for a specific subject
studentSchema.methods.getSubjectAttendance = function(subjectId) {
    const subject = this.subjects.find(s => s.subject.toString() === subjectId.toString());
    if (!subject || subject.totalClasses === 0) return 0;
    return (subject.presentClasses / subject.totalClasses) * 100;
};

// Method to update attendance counts
studentSchema.methods.updateAttendanceCounts = async function(subjectId, status, increment = true) {
    const subject = this.subjects.find(s => s.subject.toString() === subjectId.toString());
    if (!subject) return;

    const value = increment ? 1 : -1;
    
    if (status === 'present') subject.presentClasses += value;
    else if (status === 'absent') subject.absentClasses += value;
    else if (status === 'cancelled') subject.cancelledClasses += value;
    
    subject.totalClasses = subject.presentClasses + subject.absentClasses + subject.cancelledClasses;
    
    await this.save();
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student; 