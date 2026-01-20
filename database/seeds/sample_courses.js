const mongoose = require('mongoose');
const Course = require('../../backend/src/models/Course.model');
const User = require('../../backend/src/models/User.model');
require('dotenv').config({ path: '../../backend/.env' });

const sampleCourses = [
    {
        title: "Mathématiques Avancées - Niveau Lycée",
        slug: "mathematiques-avancees-lycee",
        description: "Cours complet de mathématiques pour le niveau lycée, couvrant l'algèbre, la géométrie, et l'analyse.",
        shortDescription: "Maîtrisez les mathématiques du lycée avec des exercices pratiques",
        category: "mathematics",
        level: "intermediate",
        price: 499,
        discountedPrice: 399,
        durationHours: 30,
        totalLessons: 45,
        requirements: ["Niveau collège en mathématiques", "Calculatrice scientifique"],
        learningObjectives: [
            "Résoudre des équations complexes",
            "Comprendre les fonctions",
            "Maîtriser la géométrie dans l'espace"
        ],
        tags: ["maths", "lycée", "bac", "algèbre", "géométrie"]
    },
    {
        title: "Physique Quantique pour Débutants",
        slug: "physique-quantique-debutants",
        description: "Introduction à la physique quantique avec des exemples concrets et des démonstrations.",
        shortDescription: "Découvrez les mystères de la physique quantique",
        category: "physics",
        level: "beginner",
        price: 299,
        durationHours: 20,
        totalLessons: 30,
        requirements: ["Bases en physique"],
        learningObjectives: [
            "Comprendre les principes de base",
            "Résoudre des problèmes simples",
            "Applications pratiques"
        ],
        tags: ["physique", "quantique", "science", "débutant"]
    },
    {
        title: "Développement Web Full Stack",
        slug: "developpement-web-fullstack",
        description: "Apprenez à créer des applications web modernes avec React, Node.js et MongoDB.",
        shortDescription: "Devenez développeur full stack en 3 mois",
        category: "computer_science",
        level: "beginner",
        price: 899,
        discountedPrice: 699,
        durationHours: 60,
        totalLessons: 80,
        requirements: ["Connaissances de base en informatique"],
        learningObjectives: [
            "Créer des sites web responsives",
            "Développer des APIs REST",
            "Gérer des bases de données",
            "Déployer des applications"
        ],
        tags: ["web", "react", "nodejs", "mongodb", "fullstack"]
    }
];

const createSampleCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educours');
        console.log('Connected to MongoDB');

        // Find a teacher
        const teacher = await User.findOne({ role: 'teacher', isActive: true });
        
        if (!teacher) {
            console.log('No teacher found. Creating a sample teacher first...');
            // You might want to create a teacher here or use the admin
            const admin = await User.findOne({ role: 'admin' });
            if (!admin) {
                throw new Error('No admin user found');
            }
            teacher = admin;
        }

        // Check if courses already exist
        const existingCourses = await Course.find({
            slug: { $in: sampleCourses.map(c => c.slug) }
        });

        if (existingCourses.length > 0) {
            console.log(`${existingCourses.length} sample courses already exist`);
            process.exit(0);
        }

        // Create courses with teacher
        const coursesWithTeacher = sampleCourses.map(course => ({
            ...course,
            teacher: teacher._id,
            isPublished: true,
            isApproved: true,
            publishedAt: new Date(),
            approvalDate: new Date(),
            approvedBy: teacher._id
        }));

        await Course.insertMany(coursesWithTeacher);
        console.log(`✅ ${coursesWithTeacher.length} sample courses created successfully`);

    } catch (error) {
        console.error('❌ Error creating sample courses:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

if (require.main === module) {
    createSampleCourses();
}

module.exports = createSampleCourses;