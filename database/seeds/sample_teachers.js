const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../backend/src/models/User.model');
require('dotenv').config({ path: '../../backend/.env' });

const sampleTeachers = [
    {
        email: 'prof.maths@educours.ma',
        username: 'prof_maths',
        firstName: 'Ahmed',
        lastName: 'Benali',
        phoneNumber: '+212611111111',
        bio: 'Professeur de mathématiques avec 15 ans d\'expérience, spécialiste en préparation au baccalauréat.',
        specialization: 'Mathématiques',
        experienceYears: 15,
        education: [
            {
                degree: "Doctorat en Mathématiques",
                institution: "Université Mohammed V",
                year: 2010
            }
        ]
    },
    {
        email: 'prof.physique@educours.ma',
        username: 'prof_physique',
        firstName: 'Fatima',
        lastName: 'Zahra',
        phoneNumber: '+212622222222',
        bio: 'Enseignante de physique passionnée par les sciences et l\'innovation pédagogique.',
        specialization: 'Physique',
        experienceYears: 10,
        education: [
            {
                degree: "Master en Physique Appliquée",
                institution: "École Normale Supérieure",
                year: 2012
            }
        ]
    },
    {
        email: 'prof.informatique@educours.ma',
        username: 'prof_info',
        firstName: 'Karim',
        lastName: 'El Amrani',
        phoneNumber: '+212633333333',
        bio: 'Développeur senior et formateur en informatique avec expertise en web development.',
        specialization: 'Informatique',
        experienceYears: 8,
        education: [
            {
                degree: "Ingénieur en Informatique",
                institution: "École Mohammadia d'Ingénieurs",
                year: 2014
            }
        ]
    }
];

const createSampleTeachers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours');
        console.log('Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const defaultPassword = 'Teacher@123';

        for (const teacherData of sampleTeachers) {
            // Check if teacher already exists
            const existingTeacher = await User.findOne({ 
                email: teacherData.email 
            });

            if (existingTeacher) {
                console.log(`Teacher ${teacherData.email} already exists`);
                continue;
            }

            // Create teacher user
            const passwordHash = await bcrypt.hash(defaultPassword, salt);

            const teacher = new User({
                email: teacherData.email,
                username: teacherData.username,
                passwordHash: passwordHash,
                firstName: teacherData.firstName,
                lastName: teacherData.lastName,
                role: 'teacher',
                phoneNumber: teacherData.phoneNumber,
                isVerified: true,
                isActive: true,
                profile: {
                    bio: teacherData.bio,
                    specialization: teacherData.specialization,
                    experienceYears: teacherData.experienceYears,
                    education: teacherData.education,
                    socialLinks: {
                        linkedin: '',
                        twitter: '',
                        website: ''
                    }
                },
                preferences: {
                    notifications: {
                        email: true,
                        sms: true
                    },
                    language: 'fr',
                    theme: 'light'
                }
            });

            await teacher.save();
            console.log(`✅ Teacher created: ${teacherData.email}`);
            console.log(`   Password: ${defaultPassword}`);
        }

        console.log('\n⚠️  IMPORTANT: Teachers should change their passwords!');

    } catch (error) {
        console.error('❌ Error creating sample teachers:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

if (require.main === module) {
    createSampleTeachers();
}

module.exports = createSampleTeachers;