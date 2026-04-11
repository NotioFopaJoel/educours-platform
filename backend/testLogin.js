// testLogin.js
const axios = require('axios');

async function testLogin() {
    try {
        console.log('🧪 Test de connexion API...\n');

        // Test 1: Votre compte
        console.log('1. Test avec admi123n@educour.com');
        try {
            const response1 = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'admi123n@educour.com',
                password: 'Admin@1234' // Remplacez par votre vrai mot de passe
            });
            console.log('✅ Succès:', response1.data);
        } catch (error1) {
            console.log('❌ Erreur:', error1.response?.data || error1.message);
        }

        // Test 2: Nouvel admin
        console.log('\n2. Test avec admin@educours.com');
        try {
            const response2 = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'admin@educours.com',
                password: 'AdminSecure@2024'
            });
            console.log('✅ Succès:', response2.data?.message || 'Connecté');
            console.log('Token reçu:', response2.data?.data?.token ? 'OUI' : 'NON');
        } catch (error2) {
            console.log('❌ Erreur:', error2.response?.data || error2.message);
        }

        // Test 3: Vérifier l'API
        console.log('\n3. Test santé API');
        try {
            const health = await axios.get('http://localhost:5000/health');
            console.log('✅ API en ligne:', health.data);
        } catch (error3) {
            console.log('❌ API hors ligne:', error3.message);
        }

    } catch (error) {
        console.error('Erreur générale:', error);
    }
}

testLogin();