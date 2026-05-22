import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBbsVnlPCmJYsULjYGv9sCbP9QncRkKCqQ',
  authDomain: 'saasteamworkspace.firebaseapp.com',
  projectId: 'saasteamworkspace',
  storageBucket: 'saasteamworkspace.appspot.com',
  messagingSenderId: '38490251130',
  appId: '1:38490251130:web:b0029efc538a6beddac0c3',
  measurementId: 'G-BW7SYYQ6P7',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider }
