const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Old collections that can be safely deleted
const OLD_COLLECTIONS_TO_DELETE = [
  'analytics_sessions',           // Replaced by analytics_sessions_v2
  'analytics_button_clicks',     // Replaced by analytics_button_clicks_v2
  'analytics_tour_interactions', // Replaced by analytics_tour_interactions_v2
  'tour_events',                 // Old tour tracking (replaced by analytics_tour_interactions_v2)
  'analytics_device_info',       // Replaced by analytics_device_info_v2
  'analytics_geo_data',          // Replaced by analytics_geo_data_v2
  'analytics_performance',       // Replaced by analytics_performance_v2
  'analytics_user_flows',        // Replaced by analytics_user_flows_v2
  'analytics_page_views',        // Replaced by analytics_page_views_v2
  'analytics_chat_messages',     // Replaced by analytics_chat_messages_v2
];

// Current v2 collections (DO NOT DELETE)
const CURRENT_V2_COLLECTIONS = [
  'analytics_sessions_v2',
  'analytics_chat_messages_v2',
  'analytics_button_clicks_v2',
  'analytics_tour_interactions_v2',
  'analytics_device_info_v2',
  'analytics_geo_data_v2',
  'analytics_visitor_locations_v2',
  'analytics_performance_v2',
  'analytics_user_flows_v2',
];

async function analyzeCollections() {
  console.log('🔍 Analyzing Firebase Collections...\n');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📊 Collections Analysis:');
    console.log('========================\n');
    
    // Check old collections
    console.log('❌ OLD COLLECTIONS (Safe to Delete):');
    for (const collectionName of OLD_COLLECTIONS_TO_DELETE) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        const docCount = snapshot.size;
        
        if (docCount > 0) {
          console.log(`   📁 ${collectionName}: ${docCount} documents`);
        } else {
          console.log(`   📁 ${collectionName}: Empty (or doesn't exist)`);
        }
      } catch (error) {
        console.log(`   📁 ${collectionName}: Error checking (likely doesn't exist)`);
      }
    }
    
    console.log('\n✅ CURRENT V2 COLLECTIONS (Keep These):');
    for (const collectionName of CURRENT_V2_COLLECTIONS) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        const docCount = snapshot.size;
        console.log(`   📁 ${collectionName}: ${docCount} documents`);
      } catch (error) {
        console.log(`   📁 ${collectionName}: Empty (or doesn't exist)`);
      }
    }
    
    console.log('\n🗑️  CLEANUP RECOMMENDATIONS:');
    console.log('=============================');
    console.log('1. The old collections can be safely deleted');
    console.log('2. All new data is going to the _v2 collections');
    console.log('3. To delete collections in Firebase Console:');
    console.log('   - Go to https://console.firebase.google.com/');
    console.log('   - Select your project');
    console.log('   - Go to Firestore Database');
    console.log('   - Delete collections manually (Firebase doesn\'t allow bulk collection deletion via API)');
    
    console.log('\n📋 Collections to Delete (copy this list):');
    OLD_COLLECTIONS_TO_DELETE.forEach(name => {
      console.log(`   - ${name}`);
    });
    
  } catch (error) {
    console.error('Error analyzing collections:', error);
  }
}

async function deleteOldDocuments() {
  console.log('🗑️  Starting cleanup of old collections...\n');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    let totalDeleted = 0;
    
    for (const collectionName of OLD_COLLECTIONS_TO_DELETE) {
      try {
        console.log(`🔄 Processing ${collectionName}...`);
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          console.log(`   ✅ ${collectionName}: Already empty`);
          continue;
        }
        
        console.log(`   📄 Found ${snapshot.size} documents to delete`);
        
        // Delete documents in batches
        const deletePromises = [];
        snapshot.docs.forEach((document) => {
          deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
        });
        
        await Promise.all(deletePromises);
        totalDeleted += snapshot.size;
        console.log(`   ✅ ${collectionName}: Deleted ${snapshot.size} documents`);
        
      } catch (error) {
        console.log(`   ❌ ${collectionName}: Error - ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Cleanup complete! Deleted ${totalDeleted} total documents`);
    console.log('📝 Note: Empty collections will be automatically removed by Firebase');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the script
const mode = process.argv[2];

if (mode === 'delete') {
  console.log('⚠️  WARNING: This will delete all documents in old collections!');
  console.log('⚠️  Make sure you have backups if needed!');
  console.log('⚠️  Press Ctrl+C within 5 seconds to cancel...\n');
  
  setTimeout(() => {
    deleteOldDocuments();
  }, 5000);
} else {
  console.log('Usage:');
  console.log('  node cleanup-old-collections.js        # Analyze collections');
  console.log('  node cleanup-old-collections.js delete # Delete old collections');
  console.log('');
  analyzeCollections();
} 