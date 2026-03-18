import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ConnectionsPage from './pages/ConnectionsPage';
import ContactsPage from './pages/ContactsPage';
import MessagesPage from './pages/MessagesPage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route
            path="/connections"
            element={
              <ProtectedRoute>
                <Layout>
                  {(props) => <ConnectionsPage {...props} />}
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/connections/:connectionId/contacts"
            element={
              <ProtectedRoute>
                <Layout>
                  {(props) => <ContactsPage {...props} />}
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/connections/:connectionId/messages"
            element={
              <ProtectedRoute>
                <Layout>
                  {(props) => <MessagesPage {...props} />}
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/connections" replace />} />
          <Route path="*" element={<Navigate to="/connections" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
