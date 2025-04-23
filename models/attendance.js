const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student reference is required']
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject reference is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    status: {
        type: String,
        required: [true, 'Attendance status is required'],
        enum: ['present', 'absent', 'cancelled'],
        default: 'absent'
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference who marked attendance is required']
    },
    remarks: {
        type: String,
        trim: true,
        maxLength: [200, 'Remarks cannot be more than 200 characters']
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying and ensuring unique attendance records
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

// Middleware to update lastUpdated timestamp
attendanceSchema.pre('save', async function(next) {
    this.lastUpdated = new Date();
    
    // Update student's attendance counts
    const Student = mongoose.model('Student');
    const student = await Student.findById(this.student);
    
    if (student) {
        if (this.isModified('status') && !this.isNew) {
            // If status is modified, first decrement the old status
            await student.updateAttendanceCounts(this.subject, this.status, false);
        }
        // Then increment the new status
        await student.updateAttendanceCounts(this.subject, this.status, true);
    }
    
    next();
});

// Middleware to handle attendance deletion
attendanceSchema.pre('remove', async function(next) {
    const Student = mongoose.model('Student');
    const student = await Student.findById(this.student);
    
    if (student) {
        // Decrement the attendance count when record is deleted
        await student.updateAttendanceCounts(this.subject, this.status, false);
    }
    
    next();
});

// Static method to get attendance statistics
attendanceSchema.statics.getAttendanceStats = async function(studentId, subjectId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                student: mongoose.Types.ObjectId(studentId),
                subject: mongoose.Types.ObjectId(subjectId),
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

// Static method to get monthly attendance
attendanceSchema.statics.getMonthlyAttendance = async function(studentId, subjectId, year, month) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return this.find({
        student: studentId,
        subject: subjectId,
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort('date');
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
