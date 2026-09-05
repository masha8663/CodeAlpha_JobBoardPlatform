const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Employer, Candidate, JobListing, Application } = require('./models');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Force Reset & Seed 10 Full Featured Live Jobs
async function forceSeed10Jobs() {
  try {
    const jobCount = await JobListing.countDocuments();
    if (jobCount < 5) {
      await JobListing.deleteMany({});
      await Employer.deleteMany({});

      const emp1 = await Employer.create({ companyName: 'Google Cloud Tech', email: 'hr@googlecloud.com', location: 'Mountain View, CA' });
      const emp2 = await Employer.create({ companyName: 'Meta Innovation Lab', email: 'careers@meta.com', location: 'Menlo Park, CA' });
      const emp3 = await Employer.create({ companyName: 'CodeAlpha Inc', email: 'support@codealpha.tech', location: 'Remote' });

      await JobListing.insertMany([
        { employerId: emp1._id, title: 'Senior MERN Stack Engineer', category: 'Engineering', jobType: 'Remote', location: 'Remote', salaryRange: '$120,000 - $150,000', description: 'Design and deploy high-throughput Node.js microservices with MongoDB database.' },
        { employerId: emp2._id, title: 'Lead UI/UX Product Designer', category: 'Design', jobType: 'Full-Time', location: 'New York, NY', salaryRange: '$95,000 - $120,000', description: 'Design interactive web design tokens and enterprise Figma components.' },
        { employerId: emp3._id, title: 'Full Stack Web Developer', category: 'Engineering', jobType: 'Full-Time', location: 'Austin, TX', salaryRange: '$85,000 - $110,000', description: 'Develop web apps with Express, Node.js, and client dashboards.' },
        { employerId: emp1._id, title: 'Growth Marketing Manager', category: 'Marketing', jobType: 'Full-Time', location: 'San Francisco, CA', salaryRange: '$80,000 - $100,000', description: 'Execute user acquisition strategy and SEO growth pipelines.' },
        { employerId: emp2._id, title: 'Python Django Backend Architect', category: 'Engineering', jobType: 'Contract', location: 'Chicago, IL', salaryRange: '$75/hr', description: 'Build REST APIs, ORM data models, and authentication logic.' },
        { employerId: emp3._id, title: 'AWS Cloud DevOps Specialist', category: 'Engineering', jobType: 'Remote', location: 'Remote', salaryRange: '$130,000 - $160,000', description: 'Manage Kubernetes clusters, Docker setups, and CI/CD pipelines.' },
        { employerId: emp1._id, title: 'Brand Identity & Visual Designer', category: 'Design', jobType: 'Remote', location: 'Remote', salaryRange: '$65,000 - $80,000', description: 'Craft visual style guides, marketing graphics, and brand assets.' },
        { employerId: emp2._id, title: 'SEO & Technical Content Lead', category: 'Marketing', jobType: 'Full-Time', location: 'Seattle, WA', salaryRange: '$70,000 - $85,000', description: 'Drive technical SEO audits, keyword ranking, and organic traffic growth.' },
        { employerId: emp3._id, title: 'React Native Mobile Developer', category: 'Engineering', jobType: 'Full-Time', location: 'Boston, MA', salaryRange: '$110,000 - $135,000', description: 'Build native iOS & Android applications using React Native.' },
        { employerId: emp1._id, title: 'Social Media & Community Lead', category: 'Marketing', jobType: 'Remote', location: 'Remote', salaryRange: '$60,000 - $75,000', description: 'Engage developer communities on LinkedIn, Twitter, and Discord.' }
      ]);
      console.log('✅ 10 Real-world Live Jobs Seeded Successfully!');
    }
  } catch (err) { console.error('Seed Error:', err); }
}
forceSeed10Jobs();

// API 1: Live Filter Search Engine
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, category, jobType } = req.query;
    let query = { isActive: true };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex }
      ];
    }

    if (category && category.trim() !== '' && category !== 'All Categories') {
      query.category = category.trim();
    }

    if (jobType && jobType.trim() !== '' && jobType !== 'All Types') {
      query.jobType = jobType.trim();
    }

    const jobs = await JobListing.find(query).populate('employerId').sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 2: Post New Job
app.post('/api/jobs', async (req, res) => {
  try {
    const { companyName, email, title, category, jobType, location, salaryRange, description } = req.body;
    let employer = await Employer.findOne({ email });
    if (!employer) employer = await Employer.create({ companyName, email, location });

    const newJob = new JobListing({ employerId: employer._id, title, category, jobType, location, salaryRange, description });
    await newJob.save();
    res.json({ success: true, job: newJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 3: Apply & Upload Resume
app.post('/api/apply', upload.single('resume'), async (req, res) => {
  try {
    const { jobId, fullName, email, phone, coverLetter } = req.body;
    const resumePath = req.file ? req.file.path : '';

    let candidate = await Candidate.findOne({ email });
    if (!candidate) candidate = await Candidate.create({ fullName, email, phone, resumePath });

    const application = new Application({ jobId, candidateId: candidate._id, coverLetter, resumePath });
    await application.save();
    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 4: Candidate Track Applications
app.get('/api/applications/candidate/:email', async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ email: req.params.email });
    if (!candidate) return res.json([]);
    const apps = await Application.find({ candidateId: candidate._id }).populate({ path: 'jobId', populate: { path: 'employerId' } });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 5: Admin User Management & Applications Status
app.get('/api/admin/users', async (req, res) => {
  const candidates = await Candidate.find();
  const employers = await Employer.find();
  res.json({ candidates, employers });
});

app.get('/api/admin/applications', async (req, res) => {
  const apps = await Application.find().populate('candidateId').populate('jobId');
  res.json(apps);
});

app.put('/api/admin/applications/:id/status', async (req, res) => {
  const appItem = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json({ success: true, application: appItem });
});

app.get('/api/admin/stats', async (req, res) => {
  const totalJobs = await JobListing.countDocuments();
  const totalEmployers = await Employer.countDocuments();
  const totalCandidates = await Candidate.countDocuments();
  const totalApplications = await Application.countDocuments();
  res.json({ totalJobs, totalEmployers, totalCandidates, totalApplications });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(5000, () => console.log('🚀 HireSphere Server running on http://localhost:5000'));