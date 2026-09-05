const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/hiresphere_jobboard_db')
  .then(() => console.log('✅ Connected to HireSphere Enterprise DB'))
  .catch(err => console.error('Database Error:', err));

const employerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  industry: String,
  location: String,
  verified: { type: Boolean, default: true }
});

const candidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  resumePath: String,
  createdAt: { type: Date, default: Date.now }
});

const jobListingSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },
  title: { type: String, required: true },
  category: { type: String, required: true },
  jobType: { type: String, enum: ['Full-Time', 'Part-Time', 'Remote', 'Contract'], default: 'Full-Time' },
  location: String,
  salaryRange: String,
  description: String,
  isActive: { type: Boolean, default: true },
  postedAt: { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobListing' },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  coverLetter: String,
  resumePath: String,
  status: { type: String, enum: ['Submitted', 'Under Review', 'Shortlisted', 'Rejected', 'Hired'], default: 'Submitted' },
  appliedAt: { type: Date, default: Date.now }
});

const Employer = mongoose.model('Employer', employerSchema);
const Candidate = mongoose.model('Candidate', candidateSchema);
const JobListing = mongoose.model('JobListing', jobListingSchema);
const Application = mongoose.model('Application', applicationSchema);

module.exports = { Employer, Candidate, JobListing, Application };